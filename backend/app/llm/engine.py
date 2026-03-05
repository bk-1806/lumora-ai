import os
import re
from typing import List, Dict, Tuple
from dotenv import load_dotenv
from groq import Groq
from app.nlp.processor import nlp

# =========================
# Load Environment Variables
# =========================
load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")

client = None
if groq_api_key:
    client = Groq(api_key=groq_api_key)
else:
    print("Warning: GROQ_API_KEY not found in environment variables.")

MODEL_NAME = "llama-3.1-8b-instant"


# =========================
# LLM Output Cleaning
# =========================

# Patterns that indicate the LLM is talking about its output rather than giving the output
_LLM_META_PREFIXES = re.compile(
    r"^("
    r"here(?:'s| is) (?:a |an |the )?(?:refined|updated|revised|improved|tailored|rewritten|professional|new|optimized)?.*?(?:summary|letter|version|response|output|rewrite|draft)[^.]*[.:]\s*"
    r"|(?:below is|here's|here is|please find|i've (?:refined|rewritten|updated|tailored|revised|improved)|the following)[^.]*[.:]\s*"
    r"|(?:refined|rewritten|improved|tailored|updated|revised) (?:professional )?summary[^:]*:\s*"
    r")",
    re.IGNORECASE | re.MULTILINE,
)


def clean_llm_output(text: str) -> str:
    """
    Strips assistant-style meta-commentary from LLM output.
    Removes prefix sentences like:
        "Here's a refined professional summary that aligns with..."
        "Below is the revised version..."
        "I've rewritten the summary to better..."
    Only the actual content is returned.
    """
    text = text.strip()

    # Remove the first line if it matches a meta prefix pattern
    lines = text.split("\n")
    cleaned_lines = []
    skipping_prefix = True

    for line in lines:
        stripped = line.strip()
        if skipping_prefix:
            if not stripped:
                continue  # skip empty lines at start
            if _LLM_META_PREFIXES.match(stripped):
                continue  # skip meta prefix lines
            else:
                skipping_prefix = False
                cleaned_lines.append(line)
        else:
            cleaned_lines.append(line)

    result = "\n".join(cleaned_lines).strip()

    # Final safety: if first character is a quote mark, strip it
    result = result.strip('"').strip("'").strip()

    return result


# =========================
# Detect Weak Bullets
# =========================
def detect_weak_bullets(experience_text: str) -> List[str]:
    if not experience_text:
        return []

    weak_phrases = [
        "worked on",
        "responsible for",
        "helped with",
        "assisted in",
        "assisted",
        "did",
        "made"
    ]

    bullets = [l.strip() for l in experience_text.split('\n') if l.strip()]
    weak_bullets = []

    for bullet in bullets:
        bullet_lower = bullet.lower()

        if any(phrase in bullet_lower for phrase in weak_phrases):
            weak_bullets.append(bullet)
            continue

        has_metrics = bool(re.search(r'\d+', bullet))
        if not has_metrics and len(bullet) < 60:
            weak_bullets.append(bullet)
            continue

        if nlp:
            doc = nlp(bullet)
            has_verb = any(token.pos_ == "VERB" for token in doc)
            if not has_verb:
                weak_bullets.append(bullet)

    return weak_bullets


# =========================
# Rewrite Weak Bullets
# =========================
def rewrite_bullets(weak_bullets: List[str], jd_keywords: List[str]) -> Dict[str, str]:
    if not weak_bullets or not client:
        return {b: b for b in weak_bullets}

    prompt = (
        "Rewrite the following resume bullets to be more impactful and action-oriented. "
        "Do NOT fabricate experience. "
        f"Align lightly with these keywords: {', '.join(jd_keywords[:10])}\n\n"
        "Output ONLY the rewritten bullets, one per line, with no preamble.\n\n"
    )

    for bullet in weak_bullets:
        prompt += f"- {bullet}\n"

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
        )

        output = response.choices[0].message.content.strip()
        improved_lines = [l.strip("- ").strip() for l in output.split("\n") if l.strip()]

        result = {}
        for i, original in enumerate(weak_bullets):
            if i < len(improved_lines):
                result[original] = improved_lines[i]
            else:
                result[original] = original

        return result

    except Exception as e:
        print("Groq rewrite error:", str(e))
        return {b: b for b in weak_bullets}


# =========================
# Refine Summary  (Bug Fix #1: clean LLM prefix text)
# =========================
def refine_summary(original_summary: str, jd_keywords: List[str]) -> str:
    if not client or not original_summary:
        return original_summary

    prompt = (
        "Rewrite this professional resume summary to better align with the given job keywords. "
        "Do NOT invent new skills or experience. "
        "Output ONLY the final summary paragraph, with no preamble, no commentary, no 'Here is' prefix.\n\n"
        f"Keywords: {', '.join(jd_keywords[:10])}\n\n"
        f"Original Summary:\n{original_summary}"
    )

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )

        raw = response.choices[0].message.content.strip()
        return clean_llm_output(raw)

    except Exception as e:
        print("Groq summary error:", str(e))
        return original_summary


# =========================
# Generate Cover Letter
# =========================
def generate_cover_letter(resume_text: str, jd_text: str) -> str:
    if not client:
        return "Cover letter generation failed: GROQ_API_KEY missing."

    prompt = f"""Write a professional tailored cover letter under 300 words.
Be confident but not arrogant.
Do NOT invent experience.
Output ONLY the cover letter itself, starting immediately with "Dear Hiring Manager" or similar.
Do not include any preamble, commentary, or "Here is your cover letter" prefix.

Resume:
{resume_text[:2000]}

Job Description:
{jd_text[:2000]}
"""

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
        )

        raw = response.choices[0].message.content.strip()
        return clean_llm_output(raw)

    except Exception as e:
        print("Groq cover letter error:", str(e))
        return f"Cover letter generation failed: {str(e)}"


# =========================
# Resume Strengths & Weaknesses (Feature #4)
# =========================
def generate_strengths_weaknesses(
    resume_text: str,
    jd_text: str,
    keyword_score: float,
    similarity_score: float,
    quantification_score: float,
) -> Dict[str, List[str]]:
    """
    Uses the LLM to generate 3 strengths and 3 weaknesses of the resume
    relative to the job description.
    Returns: {"strengths": [...], "weaknesses": [...]}
    """
    if not client:
        return {
            "strengths": ["Could not generate — API unavailable."],
            "weaknesses": ["Could not generate — API unavailable."],
        }

    prompt = f"""You are an expert ATS analyst and resume coach.

Analyze this resume against the job description and provide exactly:
- 3 specific STRENGTHS of the resume relative to the job
- 3 specific WEAKNESSES or gaps in the resume relative to the job

Context metrics:
- Keyword Coverage: {keyword_score:.0f}/100
- Semantic Match: {similarity_score:.0f}/100
- Quantification Score: {quantification_score:.0f}/100

Resume (excerpt):
{resume_text[:1500]}

Job Description (excerpt):
{jd_text[:1000]}

Output format — use EXACTLY this structure, nothing else:
STRENGTHS:
1. <strength>
2. <strength>
3. <strength>

WEAKNESSES:
1. <weakness>
2. <weakness>
3. <weakness>
"""

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
        )

        output = response.choices[0].message.content.strip()
        return _parse_strengths_weaknesses(output)

    except Exception as e:
        print("Groq strengths/weaknesses error:", str(e))
        return {
            "strengths": ["Analysis unavailable — API error."],
            "weaknesses": ["Analysis unavailable — API error."],
        }


def _parse_strengths_weaknesses(text: str) -> Dict[str, List[str]]:
    """Parse LLM output into strengths and weaknesses lists."""
    strengths = []
    weaknesses = []
    current = None

    for line in text.split("\n"):
        stripped = line.strip()
        if not stripped:
            continue

        lower = stripped.lower()
        if "strength" in lower and ":" in stripped:
            current = "strengths"
            continue
        elif "weakness" in lower and ":" in stripped:
            current = "weaknesses"
            continue

        # Parse numbered items: "1. text" or "• text" or "- text"
        item = re.sub(r'^[\d]+[.)]\s*|^[•\-\*]\s*', '', stripped).strip()
        if item and current == "strengths":
            strengths.append(item)
        elif item and current == "weaknesses":
            weaknesses.append(item)

    # Fallback if parsing fails
    if not strengths:
        strengths = ["Strong technical background detected."]
    if not weaknesses:
        weaknesses = ["Consider adding more quantified achievements."]

    return {
        "strengths": strengths[:3],
        "weaknesses": weaknesses[:3],
    }


# =========================
# AI Interview Question Generator (Feature #5)
# =========================
def generate_interview_questions(resume_text: str, jd_text: str) -> List[str]:
    """
    Generate 5 role-specific interview questions based on the resume and JD.
    """
    if not client:
        return ["Interview question generation unavailable — API key missing."]

    prompt = f"""You are a senior technical recruiter preparing interview questions.

Based on this candidate's resume and the job description, generate exactly 5 specific, insightful interview questions.
Questions should reference specific projects, tools, or experiences mentioned in the resume.
Do NOT ask generic questions. Make them specific to THIS candidate and THIS role.

Output ONLY the 5 questions, numbered 1–5, with no preamble or commentary.

Resume (excerpt):
{resume_text[:1500]}

Job Description (excerpt):
{jd_text[:800]}
"""

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
        )

        output = response.choices[0].message.content.strip()
        return _parse_numbered_list(output, expected=5)

    except Exception as e:
        print("Groq interview questions error:", str(e))
        return ["Interview question generation failed — please try again."]


def _parse_numbered_list(text: str, expected: int = 5) -> List[str]:
    """Parse a numbered list from LLM output."""
    questions = []
    for line in text.split("\n"):
        stripped = line.strip()
        if not stripped:
            continue
        # Match: "1. text", "1) text", "1: text"
        item = re.sub(r'^[\d]+[.):\s]+', '', stripped).strip()
        if item and len(item) > 10:  # filter out fragment lines
            questions.append(item)

    if not questions:
        questions = [text.strip()]

    return questions[:expected]