import re
from typing import List
from collections import Counter

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except OSError:
    raise RuntimeError("spaCy model en_core_web_sm not installed. Install during build.")
except ImportError as e:
    print(f"Warning: spaCy could not be loaded: {e}")
    nlp = None

# Import the skill dictionary and normalization helpers
from app.nlp.skill_dictionary import TECH_SKILLS, SKILL_VARIANTS, normalize_skill


# Comprehensive set of generic/junk words never to use as ATS keywords
JUNK_WORDS = {
    "experience", "required", "responsibilities", "engineer", "company",
    "location", "role", "team", "ability", "knowledge", "strong", "candidate",
    "position", "working", "hands", "foundation", "overview", "solutions",
    "skills", "intern", "title", "job", "world", "projects", "requirement",
    "understanding", "development", "environment", "build", "work", "use",
    "using", "used", "good", "great", "excellent", "proficient", "familiar",
    "plus", "bonus", "basic", "advanced", "minimum", "preferred", "excellent",
    "communication", "problem", "solving", "analytical", "detail", "oriented",
    "fast", "learner", "motivated", "passion", "driven", "join", "contribute",
    "grow", "opportunity", "description", "qualification", "include", "include",
    "seeking", "ideal", "looking", "year", "years", "month", "week",
    "responsible", "ensure", "support", "manage", "help", "assist",
    "collaborate", "excellent", "exceptional", "dynamic", "innovative",
    "company", "organization", "firm", "startup", "enterprise", "industry",
    "sector", "domain", "research", "study", "task", "project", "program",
    "service", "product", "business", "client", "customer", "user",
    "platform", "system", "application", "tool", "technology", "process",
    "data", "model", "algorithm",  # too generic — caught by TECH_SKILLS if specific
}


def extract_keywords_from_jd(text: str) -> List[str]:
    """
    Extracts meaningful ATS keywords from a Job Description.

    Strategy:
    1. Primary pass: scan against TECH_SKILLS dictionary (multi-word, case-insensitive, boundary-safe)
       This captures multi-word terms like "machine learning", "computer vision" reliably.
    2. Secondary pass: use spaCy PROPN tokens from original-case text for any extra proper nouns
       not already captured (e.g., product names, niche tools).
    3. Deduplicate case-insensitively, normalize variants, filter junk words.
    4. Cap at 35 keywords, prioritizing dictionary-matched tech terms.
    """

    if not text:
        return []

    text_lower = text.lower()
    found_from_dict = set()
    found_canonical = set()  # Track canonical forms to avoid duplicates

    # --- Pass 1: Dictionary-based multi-word extraction ---
    for skill in sorted(TECH_SKILLS, key=len, reverse=True):  # longest first for greedy match
        pattern = r'(?<![a-zA-Z0-9])' + re.escape(skill) + r'(?![a-zA-Z0-9])'
        if re.search(pattern, text_lower):
            canonical = normalize_skill(skill)
            if canonical not in found_canonical:
                found_from_dict.add(canonical)
                found_canonical.add(canonical)

    # Also check SKILL_VARIANTS appearing directly in text
    for variant, canonical in SKILL_VARIANTS.items():
        pattern = r'(?<![a-zA-Z0-9])' + re.escape(variant) + r'(?![a-zA-Z0-9])'
        if re.search(pattern, text_lower) and canonical not in found_canonical:
            found_from_dict.add(canonical)
            found_canonical.add(canonical)

    # --- Pass 2: spaCy PROPN fallback on original-case text ---
    # Build a flat set of all sub-tokens already covered by multi-word dict hits
    # e.g., if "google cloud" is found, skip individual "google" and "cloud"
    # Split on both spaces AND hyphens (handles "scikit-learn" → "scikit", "learn")
    covered_subtokens: set = set()
    import re as _re
    for skill in found_from_dict:
        for part in _re.split(r'[\s\-]', skill):
            if len(part) >= 3:
                covered_subtokens.add(part.lower())

    extra_propn = []
    if nlp:
        doc = nlp(text)  # original case — PROPN detection works better
        
        ignore_entities = set()
        for ent in doc.ents:
            if ent.label_ in {"PERSON", "GPE", "LOC", "DATE", "TIME", "MONEY", "PERCENT", "QUANTITY"}:
                for token in ent:
                    ignore_entities.add(token.text.lower())
                    
        for token in doc:
            word = token.text.strip().lower()

            # Only PROPN (proper nouns — tool/library names) with length > 2
            if token.pos_ != "PROPN":
                continue
            if len(word) < 3:
                continue
            if token.is_stop:
                continue
            if word in JUNK_WORDS or word in {"experience", "analysis", "skill", "ability", "knowledge"}:
                continue
            if word in ignore_entities:
                continue
            if not _re.match(r'^[a-zA-Z0-9][a-zA-Z0-9+#.\-]*$', token.text):
                continue  # skip tokens with weird punctuation
            # Skip if this token is just a sub-word of an already-found multi-word skill
            if word in covered_subtokens:
                continue
            if word not in found_canonical:
                extra_propn.append(word)

    # Rank PROPN tokens by frequency in the JD
    propn_counts = Counter(extra_propn)
    propn_ranked = [w for w, _ in propn_counts.most_common(10)]

    # --- Combine: dict hits first (most reliable), then PROPN extras ---
    dict_hits = sorted(found_from_dict)

    # Only include PROPN extras if they look like real tool names (len >= 3)
    combined = list(dict_hits)
    for word in propn_ranked:
        if len(combined) >= 35:
            break
        if word not in [k.lower() for k in combined] and len(word) >= 3:
            combined.append(word)

    return combined[:35]


def normalize_text(text: str) -> str:
    """
    Removes stopwords, punctuation, and normalizes text for semantic matching.
    """
    if not nlp:
        return text.lower()

    doc = nlp(text)

    tokens = [
        token.lemma_.lower()
        for token in doc
        if not token.is_stop
        and not token.is_punct
        and token.is_alpha
    ]

    return " ".join(tokens)


def extract_tech_skills(text: str) -> List[str]:
    """
    Extracts recognized tech skills from any text (resume, JD, etc.).
    Combines a predefined technical vocabulary with NLP extraction,
    while filtering out generic non-skill terms.
    """
    if not text:
        return []

    text_lower = text.lower()
    found_from_dict = set()
    found_canonical = set()

    for skill in sorted(TECH_SKILLS, key=len, reverse=True):
        pattern = r'(?<![a-zA-Z0-9])' + re.escape(skill) + r'(?![a-zA-Z0-9])'
        if re.search(pattern, text_lower):
            canonical = normalize_skill(skill)
            if canonical not in found_canonical:
                found_from_dict.add(canonical)
                found_canonical.add(canonical)

    for variant, canonical in SKILL_VARIANTS.items():
        pattern = r'(?<![a-zA-Z0-9])' + re.escape(variant) + r'(?![a-zA-Z0-9])'
        if re.search(pattern, text_lower) and canonical not in found_canonical:
            found_from_dict.add(canonical)
            found_canonical.add(canonical)

    extra_skills = set()
    if nlp:
        doc = nlp(text)
        
        covered_subtokens = set()
        import re as _re
        for skill in found_from_dict:
            for part in _re.split(r'[\s\-]', skill):
                if len(part) >= 3:
                    covered_subtokens.add(part.lower())

        ignore_entities = set()
        for ent in doc.ents:
            if ent.label_ in {"PERSON", "GPE", "LOC", "DATE", "TIME", "MONEY", "PERCENT", "QUANTITY", "ORDINAL", "CARDINAL", "ORG"}:
                for token in ent:
                    ignore_entities.add(token.text.lower())

        for token in doc:
            word = token.text.strip().lower()
            
            if token.pos_ not in {"PROPN", "NOUN"}:
                continue
            if len(word) < 3:
                continue
            if token.is_stop:
                continue
            if word in JUNK_WORDS or word in {"experience", "analysis", "skill", "ability", "knowledge", "understanding", "expert", "proficient", "familiar"}:
                continue
            if word in ignore_entities:
                continue
            if not _re.match(r'^[a-zA-Z0-9][a-zA-Z0-9+#.\-]*$', token.text):
                continue
            if word in covered_subtokens or word in found_canonical:
                continue
                
            if token.pos_ == "PROPN":
                extra_skills.add(word)

    # Rank the extra skills by frequency (using overall text as heuristic is hard, so just take them)
    # Actually, we shouldn't add too many generic extra skills. We'll take up to 15 most frequent.
    extra_counts = Counter(extra_skills)
    extra_ranked = [w for w, _ in extra_counts.most_common(15)]
    
    combined = list(found_from_dict) + extra_ranked
    return sorted(list(set(combined)))


