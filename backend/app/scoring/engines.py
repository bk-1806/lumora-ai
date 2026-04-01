import re
import os
from typing import List, Dict, Any
from sklearn.metrics.pairwise import cosine_similarity
from functools import lru_cache


# ---------------------------------------------------
# Model Loading (Safe Local Cache Handling)
# ---------------------------------------------------

model = None

def get_embedding_model():
    """
    Lazy loader for SentenceTransformer to avoid heavy downloads during build.
    Uses the lighter all-MiniLM-L6-v2 (~90MB).
    """
    global model
    if model is None:
        try:
            print("Loading sentence-transformers model (all-MiniLM-L6-v2)...")
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer("all-MiniLM-L6-v2")
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Warning: Could not load sentence-transformers model. {e}")
            return None
    return model

def get_similarity_model():
    # Helper to maintain compatibility if needed elsewhere
    return get_embedding_model()


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

    model = get_embedding_model()
    if not model:
        return None

    cleaned = str(text).strip().lower()

    if not cleaned:
        return None

    return model.encode(cleaned)


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
# Skill Match Score
# ---------------------------------------------------

def calculate_skill_match(resume_skills: List[str], jd_keywords: List[str]) -> float:
    """
    Computes exact overlap percentage of recognized resume skills out of recognized JD skills.
    Returns 100.0 if there are no JD skills to match against.
    """
    if not jd_keywords:
        return 100.0
    
    resume_lower = {s.lower().strip() for s in resume_skills}
    jd_lower = {k.lower().strip() for k in jd_keywords}
    
    # Meaningful match
    matched = resume_lower.intersection(jd_lower)
    score = (len(matched) / len(jd_lower)) * 100.0
    return min(100.0, max(0.0, round(score, 2)))


# ---------------------------------------------------
# Semantic Similarity
# ---------------------------------------------------

def calculate_semantic_similarity(resume_text: str, jd_text: str) -> float:
    print("Resume length:", len(resume_text) if resume_text else 0)
    print("JD length:", len(jd_text) if jd_text else 0)

    if not resume_text or not jd_text:
        return 0.0

    try:
        emb1 = get_embedding(resume_text)
        emb2 = get_embedding(jd_text)

        if emb1 is None or emb2 is None:
            print("Warning: Embedding generation failed. Returning 0.0")
            return 0.0

        sim_matrix = cosine_similarity([emb1], [emb2])
        raw_score = max(0.0, float(sim_matrix[0][0]))
        score = raw_score * 100

        if raw_score > 0.2 and score < 5.0:
            score = 5.0

        similarity_score = round(score, 2)
        return similarity_score
    except Exception as e:
        print("Similarity engine error:", e)
        return 0.0


# ---------------------------------------------------
# Domain Mismatch Detection
# ---------------------------------------------------

# Domain keyword sets for mismatch detection
DOMAIN_KEYWORDS = {
    "software": {"python", "javascript", "react", "node", "sql", "api", "backend", "frontend", "cloud",
                 "devops", "kubernetes", "docker", "machine learning", "ai", "software engineer", "developer",
                 "programming", "code", "java", "typescript", "nextjs", "fastapi", "flask", "django"},
    "mechanical": {"mechanical", "cad", "solidworks", "autocad", "thermodynamics", "fluids", "hvac",
                  "manufacturing", "cnc", "machining", "welding", "materials", "finite element", "turbine",
                  "compressor", "piping", "pressure vessel", "mechanical engineer"},
    "electrical": {"circuit", "pcb", "vhdl", "fpga", "embedded", "firmware", "microcontroller", "plc",
                   "electrical engineer", "power systems", "motor", "transformer"},
    "medical": {"clinical", "patient", "diagnosis", "nurse", "physician", "hospital", "surgery", "medical",
                "healthcare", "pharmacist", "doctor", "nursing"},
    "finance": {"accounting", "cpa", "audit", "financial modeling", "excel", "portfolio", "equity",
                "investment", "banking", "hedge fund", "risk management"},
    "marketing": {"seo", "campaign", "brand", "social media", "content marketing", "copywriting",
                  "growth hacking", "advertising"},
}

def detect_domain(text: str) -> str:
    """Return the best-matching domain for a block of text, or 'unknown'."""
    text_lower = text.lower()
    scores = {}
    for domain, keywords in DOMAIN_KEYWORDS.items():
        scores[domain] = sum(1 for kw in keywords if kw in text_lower)
    best = max(scores, key=lambda d: scores[d])
    return best if scores[best] >= 2 else "unknown"


# ---------------------------------------------------
# Experience Relevance (with domain mismatch penalty)
# ---------------------------------------------------

def calculate_experience_relevance(experience_text: str, jd_text: str) -> float:
    print("Experience length:", len(experience_text) if experience_text else 0)
    if not experience_text or not str(experience_text).strip():
        return 0.0

    score = 20.0  # Base score for having an experience section

    # 1. Years of experience (up to 40 points)
    years = 0
    year_matches = re.findall(r'(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience', experience_text, re.IGNORECASE)
    if year_matches:
        years = max([int(y) for y in year_matches if y.isdigit()])
    else:
        date_matches = re.findall(r'(20\d{2})\s*(?:-|to|–)\s*(20\d{2}|present|current)', experience_text, re.IGNORECASE)
        for start, end in date_matches:
            try:
                start_yr = int(start)
                end_yr = 2024 if end.lower() in ('present', 'current') else int(end)
                if end_yr >= start_yr:
                    years += (end_yr - start_yr)
            except:
                pass

    if years >= 5:
        score += 40
    elif years >= 3:
        score += 30
    elif years >= 1:
        score += 15

    # 2. Role matching / Semantic Similarity (up to 40 points)
    try:
        sim = calculate_semantic_similarity(experience_text, jd_text)
        score += (sim * 0.4)
    except Exception as e:
        print("Experience similarity error:", e)

    # 3. Domain mismatch penalty (hard penalty for wrong field)
    resume_domain = detect_domain(experience_text)
    jd_domain = detect_domain(jd_text)

    if (resume_domain != "unknown" and jd_domain != "unknown"
            and resume_domain != jd_domain):
        # Different domains — heavy penalty
        mismatch_penalty = 40.0
        print(f"Domain mismatch detected: resume={resume_domain}, jd={jd_domain}. Penalty: -{mismatch_penalty}")
        score -= mismatch_penalty

    # 4. Seniority / Experience Level Penalty
    def get_seniority_level(text: str) -> int:
        text_lower = text.lower()
        if "intern" in text_lower or "internship" in text_lower:
            return 1
        if "junior" in text_lower or re.search(r'\b(entry\s*level|jr)\b', text_lower):
            return 2
        if "senior" in text_lower or re.search(r'\b(sr|lead|principal|staff|manager|director)\b', text_lower):
            return 4
        return 3 # Mid-level/Default
    
    resume_level = get_seniority_level(experience_text)
    jd_level = get_seniority_level(jd_text)
    
    # Penalize if resume is junior/intern but job is senior/lead
    if resume_level < jd_level and jd_level >= 3:
        penalty = 30.0 * (jd_level - resume_level)
        print(f"Seniority mismatch penalty: resume level {resume_level} vs jd level {jd_level}. Penalty: -{penalty}")
        score -= penalty
    
    # Penalize if resume is overqualified (senior applying to intern)
    elif resume_level > jd_level and jd_level == 1:
        penalty = 20.0
        print("Overqualification penalty applied.")
        score -= penalty

    return min(100.0, max(0.0, round(score, 2)))



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
# Formatting Compliance & Missing Sections
# ---------------------------------------------------

def check_formatting_compliance(structured_resume: Dict[str, Any], raw_resume: str) -> float:

    score = 100.0

    word_count = len(raw_resume.split())

    if word_count < 100:
        score -= 30
    elif word_count > 2000:
        score -= 20

    weird_chars = len(re.findall(r"[^\x00-\x7F]+", raw_resume))
    if weird_chars > 20:
        score -= min(30, weird_chars)
        
    # Check for critical missing sections
    has_skills = bool(structured_resume.get("skills", "").strip())
    has_experience = bool(structured_resume.get("experience", "").strip())
    has_education = bool(structured_resume.get("education", "").strip())
    has_projects = bool(structured_resume.get("projects", "").strip())
    
    # Heavy penalty if no experience or projects
    if not has_experience and not has_projects:
        score -= 40
        
    if not has_education:
        score -= 20
        
    if not has_skills:
        score -= 15

    return max(0.0, round(score, 2))


# ---------------------------------------------------
# Final ATS Score
# ---------------------------------------------------

def compute_final_ats_score(
    semantic_similarity: float,
    skill_match: float,
    experience_relevance: float,
    keyword_coverage: float,
    formatting_score: float
) -> float:
    """
    New Formula:
      40% Semantic Similarity
      25% Skill Match
      20% Experience Relevance
      10% Keyword Coverage
       5% Formatting Score
    """
    final_score = (
        (semantic_similarity * 0.40) +
        (skill_match * 0.25) +
        (experience_relevance * 0.20) +
        (keyword_coverage * 0.10) +
        (formatting_score * 0.05)
    )

    has_content = any([
        semantic_similarity > 0,
        skill_match > 0,
        experience_relevance > 0,
        keyword_coverage > 0
    ])

    if final_score < 10.0 and has_content:
        final_score = 10.0

    return round(final_score, 2)