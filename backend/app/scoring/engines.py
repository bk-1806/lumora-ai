import re
import os
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from functools import lru_cache


# ---------------------------------------------------
# Model Loading (Safe Local Cache Handling)
# ---------------------------------------------------

base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
cache_dir = os.path.join(base_dir, ".model_cache")
os.makedirs(cache_dir, exist_ok=True)

try:
    similarity_model = SentenceTransformer(
        "all-MiniLM-L6-v2",
        cache_folder=cache_dir
    )
except Exception as e:
    print(f"Warning: Could not load sentence-transformers model. {e}")
    similarity_model = None


# Words that are never meaningful ATS keywords (should not penalize score)
GENERIC_SCORING_WORDS = {
    "experience", "required", "skills", "role", "team", "ability",
    "knowledge", "position", "candidate", "company", "overview",
    "solutions", "opportunity", "description", "requirement",
    "working", "include", "prefer", "good", "strong", "environment",
    "project", "system", "service", "platform", "application",
    "technology", "process", "data", "model", "business",
}


# ---------------------------------------------------
# Embedding Caching
# ---------------------------------------------------

@lru_cache(maxsize=32)
def get_embedding(text: str):

    if not similarity_model:
        return None

    cleaned = str(text).strip().lower()

    if not cleaned:
        return None

    return similarity_model.encode(cleaned)


# ---------------------------------------------------
# Keyword Matching (SMART FULL-TEXT + NORMALIZED MATCH)
# ---------------------------------------------------

def calculate_keyword_match(resume_text, jd_keywords: List[str]) -> Dict[str, Any]:
    """
    Improved ATS keyword matcher.

    Changes from previous version:
    1. Accepts full resume text (not just skills list) for broader coverage
    2. Uses word-boundary regex for reliable phrase matching
    3. Applies skill variant normalization (yolov3 ↔ yolo, gcp ↔ google cloud)
    4. Filters generic/junk keywords from JD before scoring
    5. Caps missing list to top 25 technical keywords
    """

    if not jd_keywords:
        return {"score": 100.0, "matched": [], "missing": []}

    # Convert resume input to full text string
    if isinstance(resume_text, list):
        resume_text_lower = " ".join(resume_text).lower()
    else:
        resume_text_lower = str(resume_text).lower()

    resume_text_lower = resume_text_lower.strip()

    # Import variant normalization
    try:
        from app.nlp.skill_dictionary import SKILL_VARIANTS, normalize_skill
    except ImportError:
        SKILL_VARIANTS = {}
        def normalize_skill(s): return s.lower()

    def keyword_in_resume(keyword: str) -> bool:
        """
        Check if a keyword appears in resume text.
        Uses word-boundary regex. Also checks skill variants.
        """
        kw_lower = keyword.lower()

        # Direct phrase match with word boundaries
        pattern = r'(?<![a-zA-Z0-9])' + re.escape(kw_lower) + r'(?![a-zA-Z0-9])'
        if re.search(pattern, resume_text_lower):
            return True

        # Check if any variant of this keyword appears in the resume
        for variant, canonical in SKILL_VARIANTS.items():
            if canonical == kw_lower or normalize_skill(kw_lower) == canonical:
                var_pattern = r'(?<![a-zA-Z0-9])' + re.escape(variant) + r'(?![a-zA-Z0-9])'
                if re.search(var_pattern, resume_text_lower):
                    return True

        # For multi-word keywords, also check if all significant tokens appear nearby
        tokens = kw_lower.split()
        significant = [t for t in tokens if len(t) >= 4]
        if len(significant) > 1:
            # All significant tokens present anywhere = partial credit counts as match
            if all(
                re.search(r'(?<![a-zA-Z0-9])' + re.escape(t) + r'(?![a-zA-Z0-9])', resume_text_lower)
                for t in significant
            ):
                return True

        return False

    # Deduplicate JD keywords (case-insensitive, normalize variants)
    seen_canonical = set()
    filtered_keywords = []
    for kw in jd_keywords:
        kw_lower = kw.lower().strip()
        canonical = normalize_skill(kw_lower)
        # Filter pure generic words
        if kw_lower in GENERIC_SCORING_WORDS:
            continue
        if canonical not in seen_canonical:
            seen_canonical.add(canonical)
            filtered_keywords.append(kw_lower)

    if not filtered_keywords:
        return {"score": 100.0, "matched": [], "missing": []}

    matched = []
    missing = []

    for keyword in filtered_keywords:
        if keyword_in_resume(keyword):
            matched.append(keyword)
        else:
            missing.append(keyword)

    score = (len(matched) / len(filtered_keywords)) * 100 if filtered_keywords else 100

    return {
        "score": round(score, 2),
        "matched": matched,
        "missing": missing[:25],  # cap missing list
    }


# ---------------------------------------------------
# Semantic Similarity
# ---------------------------------------------------

def calculate_semantic_similarity(resume_text: str, jd_text: str) -> float:

    if not similarity_model or not resume_text or not jd_text:
        return 0.0

    emb1 = get_embedding(resume_text)
    emb2 = get_embedding(jd_text)

    if emb1 is None or emb2 is None:
        return 0.0

    sim_matrix = cosine_similarity([emb1], [emb2])

    raw_score = max(0.0, float(sim_matrix[0][0]))

    score = raw_score * 100

    if raw_score > 0.2 and score < 5.0:
        score = 5.0

    return round(score, 2)


# ---------------------------------------------------
# Quantification Detection
# ---------------------------------------------------

def detect_quantification(experience_text: str) -> float:

    if not experience_text:
        return 0.0

    bullets = [line for line in experience_text.split("\n") if line.strip()]

    if not bullets:
        return 0.0

    quantified = 0

    pattern = re.compile(r"(\d+|%|\$|million|billion|thousand)", re.IGNORECASE)

    for bullet in bullets:

        if pattern.search(bullet):
            quantified += 1

    score = (quantified / len(bullets)) * 100

    return min(100.0, round(score * 1.5, 2))


# ---------------------------------------------------
# Skill Density (FIXED)
# ---------------------------------------------------

def calculate_skill_density(resume_text: str, resume_skills: List[str]) -> float:

    if not resume_text or not resume_skills:
        return 0.0

    text_lower = resume_text.lower()

    found_count = sum(
        1 for skill in resume_skills
        if skill.lower() in text_lower
    )

    score = (found_count / len(resume_skills)) * 100 if resume_skills else 0

    return min(100.0, round(score * 1.2, 2))


# ---------------------------------------------------
# Formatting Compliance
# ---------------------------------------------------

def check_formatting_compliance(resume_text: str) -> float:

    score = 100.0

    word_count = len(resume_text.split())

    if word_count < 100:
        score -= 30

    elif word_count > 2000:
        score -= 20

    weird_chars = len(re.findall(r"[^\x00-\x7F]+", resume_text))

    if weird_chars > 20:
        score -= min(30, weird_chars)

    return max(0.0, round(score, 2))


# ---------------------------------------------------
# Final ATS Score
# ---------------------------------------------------

def compute_final_ats_score(
    keyword_score: float,
    similarity_score: float,
    experience_score: float,
    quantification_score: float,
    skill_density_score: float,
    formatting_score: float
) -> float:

    final_score = (
        (keyword_score * 0.30) +
        (similarity_score * 0.20) +
        (experience_score * 0.15) +
        (quantification_score * 0.10) +
        (skill_density_score * 0.10) +
        (formatting_score * 0.15)
    )

    has_content = any([
        keyword_score > 0,
        similarity_score > 0,
        experience_score > 0,
        quantification_score > 0
    ])

    if final_score < 10.0 and has_content:
        final_score = 10.0

    return round(final_score, 2)