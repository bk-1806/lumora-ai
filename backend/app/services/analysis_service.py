from typing import Dict, Any, List
from app.db import db_client
from app.parsers import extract_text, parse_sections
from app.nlp import extract_keywords_from_jd, normalize_text, extract_tech_skills
from app.llm import (
    detect_weak_bullets,
    rewrite_bullets,
    generate_cover_letter,
    refine_summary,
    generate_strengths_weaknesses,
    generate_interview_questions,
)
from app.scoring import (
    calculate_keyword_match,
    calculate_semantic_similarity,
    calculate_experience_relevance,
    detect_quantification,
    calculate_skill_density,
    check_formatting_compliance,
    compute_final_ats_score,
)


# ─────────────────────────────────────────────────────────────────────────────
# Skill Gap Analyzer (Feature #2)
# ─────────────────────────────────────────────────────────────────────────────

def compute_skill_gap(jd_keywords: List[str], resume_skills: List[str]) -> List[str]:
    """
    Returns the top 10 technical skills from the JD that are missing in the resume.

    Logic:
        skill_gap = set(jd_keywords) - set(resume_skills)

    Uses canonical lowercase comparison.
    Filters to skills that are meaningful (length > 2).
    """
    resume_skills_lower = {s.lower().strip() for s in resume_skills}
    jd_keywords_lower_ordered = [k.lower().strip() for k in jd_keywords]

    skill_gap = [
        kw for kw in jd_keywords_lower_ordered
        if kw not in resume_skills_lower and len(kw) > 2
    ]

    # Deduplicate while preserving order
    seen = set()
    unique_gap = []
    for kw in skill_gap:
        if kw not in seen:
            seen.add(kw)
            unique_gap.append(kw)

    return unique_gap[:10]


# ─────────────────────────────────────────────────────────────────────────────
# ATS Pass Probability (Feature #3)
# ─────────────────────────────────────────────────────────────────────────────

def compute_pass_probability(
    keyword_score: float,
    similarity_score: float,
    experience_score: float,
) -> float:
    """
    Estimates the probability (0–100%) that this resume passes ATS screening.

    Formula:
        pass_probability = keyword_score * 0.4 + similarity_score * 0.3 + experience_score * 0.3

    This weights keyword coverage most heavily, as ATS systems primarily scan for keyword matches.
    """
    raw = (
        keyword_score * 0.4 +
        similarity_score * 0.3 +
        experience_score * 0.3
    )
    return round(min(100.0, max(0.0, raw)), 2)


# ─────────────────────────────────────────────────────────────────────────────
# Helper: Format bullets for resume sections
# ─────────────────────────────────────────────────────────────────────────────

def _format_bullets_and_lines(section_text: str, improved_bullets: Dict[str, str] = None) -> List[str]:

    lines = []
    improved_bullets = improved_bullets or {}

    for line in section_text.split("\n"):

        stripped = line.strip()

        if not stripped or stripped == "•":
            continue

        if stripped in improved_bullets and improved_bullets[stripped]:
            stripped = improved_bullets[stripped].strip()

        import re

        content = re.sub(r'^[•\-\*]\s*', '', stripped).strip()

        is_bullet = line.lstrip().startswith(('•', '-', '*')) or stripped.startswith(('•', '-', '*'))

        content = content.replace("::", ":")

        if is_bullet and content:
            lines.append(f"• {content}")

        elif content:
            lines.append(content)

    return lines


# ─────────────────────────────────────────────────────────────────────────────
# Build Optimized Resume Text
# ─────────────────────────────────────────────────────────────────────────────

def build_optimized_resume_text(
    structured_resume: Dict[str, Any],
    improved_bullets: Dict[str, str],
    refined_summary: str
) -> str:

    import re

    DIVIDER = "----------------------------------------"
    lines = []

    def clean_text(text: str):

        if not text:
            return ""

        text = text.replace("::", ":")
        text = text.replace("◦", "•")

        return text.strip()

    def add_section(title: str, content_lines: list):

        lines.append("")
        lines.append(title.upper())
        lines.append(DIVIDER)

        if content_lines:
            lines.extend(content_lines)

    def format_block(text: str, inject_map: Dict[str, str] = None):

        formatted = []

        for raw_line in text.split("\n"):

            line = clean_text(raw_line)

            if not line:
                continue

            # Filter isolated fragments
            word_count = len(line.split())
            if len(line) < 4 or word_count == 1:
                continue

            if line.startswith("•") or line.startswith("-"):

                bullet = line.lstrip("•- ").strip()

                if inject_map and bullet in inject_map:
                    bullet = inject_map[bullet].strip()

                formatted.append(f"• {bullet}")

            else:
                formatted.append(line)

        return formatted


    # HEADER
    header = clean_text(structured_resume.get("header", ""))
    header_lines = [l.strip() for l in header.split("\n") if l.strip()]

    if header_lines:

        lines.append(header_lines[0].upper())

        contacts = []

        for line in header_lines[1:]:

            parts = [p.strip() for p in re.split(r"\s*[|•]\s*", line) if p.strip()]
            contacts.extend(parts)

        if contacts:
            lines.append(" | ".join(contacts))

    lines.append("")
    lines.append(DIVIDER)


    # SUMMARY
    summary = refined_summary.strip() if refined_summary else ""

    if not summary:
        summary = structured_resume.get("summary", "").strip()

    if not summary:
        summary = (
            "Motivated Computer Science student with experience in "
            "Data Science, Machine Learning, and AI system development."
        )

    add_section("PROFESSIONAL SUMMARY", [clean_text(summary)])


    # SKILLS (remove certifications that bled in)
    skills_text = structured_resume.get("skills", "")

    filtered_skill_lines = []

    for line in skills_text.split("\n"):

        l = line.lower()

        if "certified" in l or "certification" in l:
            continue

        filtered_skill_lines.append(line)

    skills = clean_text("\n".join(filtered_skill_lines))

    add_section("SKILLS", format_block(skills))


    # EXPERIENCE
    experience = clean_text(structured_resume.get("experience", ""))

    add_section("EXPERIENCE", format_block(experience, improved_bullets))


    # PROJECTS
    projects = clean_text(structured_resume.get("projects", ""))

    add_section("PROJECTS", format_block(projects, improved_bullets))


    # CERTIFICATIONS
    certifications = clean_text(structured_resume.get("certifications", ""))

    add_section("CERTIFICATIONS", format_block(certifications))


    # LEADERSHIP
    leadership = clean_text(
        structured_resume.get("leadership", "") or
        structured_resume.get("leadership_activities", "")
    )

    add_section("LEADERSHIP & ACTIVITIES", format_block(leadership))


    # EDUCATION
    education = clean_text(structured_resume.get("education", ""))

    add_section("EDUCATION", format_block(education))


    final_text = "\n".join(lines)

    final_text = re.sub(r"\n{3,}", "\n\n", final_text)

    return final_text.strip()


# ─────────────────────────────────────────────────────────────────────────────
# Main Analysis Pipeline
# ─────────────────────────────────────────────────────────────────────────────

def process_resume_analysis(
    user_id: str,
    resume_bytes: bytes,
    resume_filename: str,
    jd_text: str
) -> Dict[str, Any]:

    raw_resume = extract_text(resume_bytes, resume_filename)

    structured_resume = parse_sections(raw_resume)

    resume_db = db_client.create_resume(user_id, raw_resume, structured_resume)


    # JD KEYWORDS
    jd_keywords = extract_keywords_from_jd(jd_text)

    jd_db = db_client.create_job_description(jd_text, jd_keywords)


    # SKILLS EXTRACTION FROM RESUME
    resume_skills = extract_tech_skills(raw_resume)


    # KEYWORD MATCHING — full resume text for broader coverage
    keyword_match_data = calculate_keyword_match(raw_resume, jd_keywords)


    similarity_score = calculate_semantic_similarity(raw_resume, jd_text)


    exp_text = structured_resume.get("experience", "")

    experience_score = calculate_experience_relevance(exp_text, jd_text)


    quantification_score = detect_quantification(exp_text)


    skill_density_score = calculate_skill_density(raw_resume, resume_skills)


    formatting_score = check_formatting_compliance(raw_resume)


    final_score = compute_final_ats_score(
        keyword_score=keyword_match_data["score"],
        similarity_score=similarity_score,
        experience_score=experience_score,
        quantification_score=quantification_score,
        skill_density_score=skill_density_score,
        formatting_score=formatting_score,
    )


    # ── Feature #2: Skill Gap Analysis ──────────────────────────────────────
    skill_gap = compute_skill_gap(jd_keywords, resume_skills)


    # ── Feature #3: ATS Pass Probability ────────────────────────────────────
    pass_probability = compute_pass_probability(
        keyword_score=keyword_match_data["score"],
        similarity_score=similarity_score,
        experience_score=experience_score,
    )


    # ── LLM Features ────────────────────────────────────────────────────────
    weak_bullets = detect_weak_bullets(exp_text)

    improved_bullets = rewrite_bullets(weak_bullets, jd_keywords)


    original_summary = structured_resume.get("summary", "")

    refined_summary = refine_summary(original_summary, jd_keywords) if original_summary else ""


    optimized_text = build_optimized_resume_text(structured_resume, improved_bullets, refined_summary)


    cover_letter = generate_cover_letter(raw_resume, jd_text)


    # ── Feature #4: Strengths & Weaknesses ──────────────────────────────────
    strengths_weaknesses = generate_strengths_weaknesses(
        resume_text=raw_resume,
        jd_text=jd_text,
        keyword_score=keyword_match_data["score"],
        similarity_score=similarity_score,
        quantification_score=quantification_score,
    )


    # ── Feature #5: AI Interview Questions ──────────────────────────────────
    interview_questions = generate_interview_questions(raw_resume, jd_text)


    # ── Optimized Resume Score (post-improvement estimate) ──────────────────
    opt_similarity_score = calculate_semantic_similarity(optimized_text, jd_text)

    opt_exp_text = "\n".join([improved_bullets.get(b.strip(), b) for b in exp_text.split('\n')])

    opt_experience_score = calculate_experience_relevance(opt_exp_text, jd_text)

    opt_quantification_score = detect_quantification(opt_exp_text)


    after_score = compute_final_ats_score(
        keyword_score=keyword_match_data["score"],
        similarity_score=opt_similarity_score,
        experience_score=opt_experience_score,
        quantification_score=opt_quantification_score,
        skill_density_score=skill_density_score,
        formatting_score=formatting_score,
    )


    improvement_percentage = max(0.0, round(after_score - final_score, 2)) if improved_bullets else 0.0


    analysis_data = {
        # Scores
        "keyword_score": keyword_match_data["score"],
        "similarity_score": similarity_score,
        "formatting_score": formatting_score,
        "quantification_score": quantification_score,
        "experience_score": experience_score,
        "skill_density": skill_density_score,
        "final_ats_score": final_score,
        "before_score": final_score,
        "after_score": after_score,
        "improvement_percentage": improvement_percentage,

        # Feature #2: Skill Gap
        "skill_gap": skill_gap,

        # Feature #3: Pass Probability
        "pass_probability": pass_probability,

        # Keywords
        "missing_keywords": keyword_match_data["missing"][:25],

        # LLM Outputs
        "improved_bullets": improved_bullets,
        "cover_letter": cover_letter,
        "optimized_resume_text": optimized_text,

        # Feature #4: Strengths & Weaknesses
        "strengths": strengths_weaknesses.get("strengths", []),
        "weaknesses": strengths_weaknesses.get("weaknesses", []),

        # Feature #5: Interview Questions
        "interview_questions": interview_questions,
    }


    result = db_client.save_analysis_result(resume_db["id"], jd_db["id"], analysis_data)

    return result