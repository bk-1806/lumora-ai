import re
from typing import Dict


SECTION_ALIASES = {
    "summary": [
        "professional summary",
        "summary",
        "career summary",
        "profile",
        "about me",
        "objective",
    ],
    "skills": [
        "skills",
        "technical skills",
        "skills summary",
        "technical expertise",
        "core competencies",
        "competencies",
        "key skills",
    ],
    "experience": [
        "experience",
        "work experience",
        "professional experience",
        "employment history",
        "work history",
        "internship",
        "internships",
    ],
    "projects": [
        "projects",
        "academic projects",
        "personal projects",
        "key projects",
        "selected projects",
    ],
    "certifications": [
        "certifications",
        "certification",
        "certificates",
        "licenses & certifications",
        "licenses and certifications",
        "awards & certifications",
        "professional certifications",
    ],
    "leadership": [
        "leadership",
        "leadership & activities",
        "leadership and activities",
        "activities",
        "leadership experience",
        "extracurricular",
        "extracurricular activities",
        "volunteering",
        "volunteer experience",
    ],
    "education": [
        "education",
        "academic background",
        "academic qualifications",
        "educational background",
        "qualifications",
    ],
}


def normalize_header(line: str) -> str:
    """
    Normalize header text.
    Removes punctuation (except &) and converts to lowercase.
    """
    cleaned = re.sub(r'[^a-zA-Z&\s]', '', line.lower())
    return re.sub(r'\s+', ' ', cleaned).strip()


def detect_section(line: str):
    """
    Detect section headers using strict matching rules.

    Rules to prevent false positives (e.g., cert names being detected as section headers):
    1. Line must be short (≤ 60 chars) — content lines are longer
    2. Line must not contain sentence-like punctuation (period, comma, colon, parentheses)
    3. Normalized text must EXACTLY match an alias OR start with it (as a whole-word prefix)
    4. Lines that are all lowercase with many words are NOT headers
    """

    stripped = line.strip()

    # Rule 1: section headers are short
    if len(stripped) > 60:
        return None

    # Rule 2: section headers don't contain typical content punctuation
    if re.search(r'[.,;:()\[\]]', stripped):
        return None

    # Rule 3: headers are predominantly uppercase or Title Case — not mixed-case sentences
    # Heuristic: if the line has more than 5 words, it's probably not a header
    word_count = len(stripped.split())
    if word_count > 5:
        return None

    # Rule 4: must have at least 2 characters
    if len(stripped) < 2:
        return None

    normalized = normalize_header(stripped)

    # Check against aliases: require exact match of the alias
    for section, aliases in SECTION_ALIASES.items():
        for alias in aliases:
            # Exact match (most reliable)
            if normalized == alias:
                return section
            # Allow trailing colon removed already; also allow alias as full prefix
            # e.g., normalized="skills" matches alias="skills"
            # e.g., normalized="technical skills" matches alias="technical skills"

    return None


def parse_sections(text: str) -> Dict[str, str]:
    """
    Robust resume section parser.

    Handles:
    • flexible headers
    • prevents section bleed (certifications spilling into skills)
    • keeps header info safe
    """

    lines = text.split("\n")

    result = {
        "header": "",
        "summary": "",
        "skills": "",
        "experience": "",
        "projects": "",
        "certifications": "",
        "leadership": "",
        "education": "",
    }

    header_lines = []
    current_section = None
    first_section_found = False

    for raw_line in lines:

        stripped = raw_line.strip()

        # skip divider lines (---, ===, ___)
        if stripped == "":
            continue
        if re.match(r'^[-=_]{3,}$', stripped):
            continue

        detected = detect_section(stripped)

        if detected:
            current_section = detected
            first_section_found = True
            continue

        # everything before first section = header
        if not first_section_found:
            header_lines.append(raw_line)
            continue

        # add to current section
        if current_section:
            result[current_section] += raw_line + "\n"

    # assign header
    result["header"] = "\n".join(header_lines).strip()

    # clean whitespace
    for key in result:
        result[key] = result[key].strip()

    return result