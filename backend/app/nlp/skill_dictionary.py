"""
Comprehensive tech skill dictionary for ATS keyword matching.
Supports multi-word phrases and variant normalization.
"""
import re

# Full set of recognized technical skills (all lowercase, multi-word supported)
TECH_SKILLS = {
    # Programming Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "bash", "shell",
    "sql", "html", "css",

    # AI / ML
    "machine learning", "deep learning", "artificial intelligence", "ai",
    "nlp", "natural language processing",
    "computer vision", "object detection",
    "neural network", "neural networks",
    "reinforcement learning", "transfer learning",
    "feature engineering", "model training", "model deployment",
    "bert", "gpt", "llm", "large language model", "transformers",
    "hugging face", "langchain", "openai",
    "yolo", "yolov3", "yolov5", "yolov8",
    "opencv",

    # Data Science
    "data science", "data analysis", "data analytics", "data visualization",
    "data preprocessing", "data wrangling", "data engineering",
    "eda", "exploratory data analysis",
    "statistics", "statistical analysis",
    "predictive modeling", "regression", "classification", "clustering",

    # Libraries & Frameworks
    "pandas", "numpy", "scikit-learn", "sklearn",
    "tensorflow", "keras", "pytorch",
    "matplotlib", "seaborn", "plotly",
    "streamlit", "gradio",
    "flask", "fastapi", "django",
    "react", "angular", "vue", "next.js", "node.js", "express",
    "spring boot", "ruby on rails",

    # Databases
    "sql", "mysql", "postgresql", "sqlite", "mongodb", "redis",
    "elasticsearch", "cassandra", "dynamodb", "firebase",

    # Cloud & DevOps
    "aws", "amazon web services",
    "gcp", "google cloud", "google cloud platform",
    "azure", "microsoft azure",
    "docker", "kubernetes", "terraform",
    "jenkins", "github actions", "gitlab ci", "ci/cd",
    "ansible", "linux",

    # Tools & Platforms
    "git", "github", "gitlab",
    "jira", "confluence", "notion",
    "postman", "swagger", "graphql",
    "power bi", "tableau", "excel", "looker",
    "airflow", "apache airflow", "dbt",
    "kafka", "spark", "hadoop",
    "n8n", "automation", "zapier",
    "figma",

    # APIs & Integration
    "rest api", "restful api", "apis", "api", "web scraping",

    # Concepts
    "microservices", "system design", "agile", "scrum",
    "object oriented programming", "oop",
    "data structures", "algorithms",
    "cloud computing", "devops", "mlops",
    "version control",
}


# Variant normalization: alternate spellings → canonical form in TECH_SKILLS
# When we encounter the KEY in text, we treat it as the VALUE
SKILL_VARIANTS = {
    "yolov3": "yolo",
    "yolov5": "yolo",
    "yolov8": "yolo",
    "scikit": "scikit-learn",
    "sklearn": "scikit-learn",
    "google cloud platform": "google cloud",
    "gcp": "google cloud",
    "amazon web services": "aws",
    "azure": "azure",
    "microsoft azure": "azure",
    "natural language processing": "nlp",
    "restful api": "rest api",
    "restful apis": "rest api",
    "restful": "rest api",
    "apis": "api",
    "artificial intelligence": "ai",
    "large language model": "llm",
    "large language models": "llm",
    "exploratory data analysis": "eda",
    "hugging face": "hugging face",
    "object oriented programming": "oop",
    "neural networks": "neural network",
}


def normalize_skill(skill: str) -> str:
    """
    Normalize a skill string to its canonical form.
    E.g. 'yolov3' → 'yolo', 'gcp' → 'google cloud'
    """
    lower = skill.strip().lower()
    return SKILL_VARIANTS.get(lower, lower)


def extract_tech_skills(text: str) -> list:
    """
    Extracts recognized technical skills from any text using:
    1. Word-boundary-safe regex matching (multi-word supported)
    2. Variant normalization for synonyms
    Returns a deduplicated list of canonical skill names.
    """
    if not text:
        return []

    text_lower = text.lower()
    found = set()

    for skill in TECH_SKILLS:
        # Use word boundaries, but also handle symbols like c++, c#, .js
        pattern = r'(?<![a-zA-Z0-9])' + re.escape(skill) + r'(?![a-zA-Z0-9])'
        if re.search(pattern, text_lower):
            # Normalize to canonical form
            canonical = normalize_skill(skill)
            found.add(canonical)

    # Also check variants directly in the text
    for variant, canonical in SKILL_VARIANTS.items():
        pattern = r'(?<![a-zA-Z0-9])' + re.escape(variant) + r'(?![a-zA-Z0-9])'
        if re.search(pattern, text_lower):
            found.add(canonical)

    return sorted(found)
