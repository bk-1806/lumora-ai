"""
Resume Copilot Chat — LLM-powered chat assistant for resume improvement.
Uses the full analysis context (scores, skill gap, strengths, weaknesses) as system context.
"""
import os
from typing import List, Dict, Any
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")
_client = None
if groq_api_key:
    _client = Groq(api_key=groq_api_key)

MODEL_NAME = "llama-3.1-8b-instant"

MAX_HISTORY = 8  # Keep last N turns in context window


def build_system_prompt(context: Dict[str, Any]) -> str:
    """
    Build a rich system prompt from the analysis context.
    Injects resume text, JD, scores, skill gap, strengths/weaknesses.
    """
    resume_text     = context.get("resume_text", "")[:2500]
    jd_text         = context.get("jd_text", "")[:1500]
    keyword_score   = context.get("keyword_score", 0)
    similarity_score = context.get("similarity_score", 0)
    experience_score = context.get("experience_score", 0)
    skill_density   = context.get("skill_density", 0)
    final_ats_score = context.get("final_ats_score", 0)
    pass_probability = context.get("pass_probability", 0)
    skill_gap       = context.get("skill_gap", [])
    strengths       = context.get("strengths", [])
    weaknesses      = context.get("weaknesses", [])
    missing_keywords = context.get("missing_keywords", [])

    skill_gap_str = ", ".join(skill_gap) if skill_gap else "None detected"
    strengths_str = "\n".join(f"  • {s}" for s in strengths) if strengths else "  • (not available)"
    weaknesses_str = "\n".join(f"  • {w}" for w in weaknesses) if weaknesses else "  • (not available)"
    missing_str = ", ".join(missing_keywords[:15]) if missing_keywords else "None"

    return f"""You are Resume Copilot — an expert AI career assistant specializing in ATS optimization, resume writing, and job application strategy.

You have full access to this candidate's analysis data. Use it to give precise, actionable advice.

=== RESUME (excerpt) ===
{resume_text}

=== JOB DESCRIPTION (excerpt) ===
{jd_text}

=== ATS ANALYSIS RESULTS ===
- Final ATS Score:       {final_ats_score:.0f} / 100
- ATS Pass Probability:  {pass_probability:.0f}%
- Keyword Coverage:      {keyword_score:.0f} / 100
- Semantic Similarity:   {similarity_score:.0f} / 100
- Experience Relevance:  {experience_score:.0f} / 100
- Skill Context Density: {skill_density:.0f} / 100

=== SKILL GAP (in JD, missing from resume) ===
{skill_gap_str}

=== RESUME STRENGTHS ===
{strengths_str}

=== RESUME WEAKNESSES ===
{weaknesses_str}

=== MISSING JD KEYWORDS ===
{missing_str}

=== YOUR BEHAVIOUR ===
- Give specific, actionable advice grounded in the data above.
- Reference actual skills, projects, or sections from the resume when relevant.
- Format your answers with bullet points or numbered lists when appropriate.
- Be concise — 3-6 bullet points max unless detail is explicitly requested.
- Never make up experience or credentials. Only suggest improvements to what exists.
- If asked to rewrite a section, do it directly without disclaimers.
"""


def chat_with_copilot(
    user_message: str,
    context: Dict[str, Any],
    conversation_history: List[Dict[str, str]] = None,
) -> str:
    """
    Main copilot chat function.

    Args:
        user_message:          The latest message from the user.
        context:               Full analysis context dict.
        conversation_history:  List of {"role": "user"|"assistant", "content": "..."} dicts.

    Returns:
        AI response string.
    """
    if not _client:
        return "Resume Copilot is unavailable — GROQ_API_KEY is not configured."

    system_prompt = build_system_prompt(context)

    messages = [{"role": "system", "content": system_prompt}]

    # Add conversation history (last N turns)
    history = conversation_history or []
    for turn in history[-MAX_HISTORY:]:
        messages.append({"role": turn["role"], "content": turn["content"]})

    messages.append({"role": "user", "content": user_message})

    try:
        response = _client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.45,
            max_tokens=800,
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Copilot chat error: {e}")
        return f"Sorry, I encountered an error: {str(e)}"
