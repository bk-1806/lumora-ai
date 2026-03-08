import asyncio
import os
import sys

# Add the backend directory to python path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.scoring.engines import calculate_semantic_similarity, calculate_experience_relevance

data_analyst_resume = """
John Doe
Data Analyst
johndoe@email.com

SUMMARY
Data Analyst with 4 years of experience analyzing large datasets, creating dashboards, and providing actionable business insights.

EXPERIENCE
Data Analyst | Tech Corp | 2020 - 2024
- Analyzed 1M+ rows of sales data using SQL and Python (Pandas).
- Created interactive Tableau dashboards for executive reporting.
- Improved data pipeline efficiency by 15%.

SKILLS
SQL, Python, Tableau, Excel, Data Analysis, Pandas
"""

data_analyst_jd = """
Looking for a Data Analyst to join our team.
Requirements:
- 3+ years of experience in data analysis.
- Strong SQL and Python skills.
- Experience with visualization tools like Tableau or PowerBI.
- Ability to analyze complex datasets and present findings.
"""

cloud_architect_jd = """
We are hiring a Senior Cloud Architect.
Requirements:
- 8+ years of experience in cloud infrastructure.
- Expert in AWS, Azure, and GCP.
- Experience designing scalable microservices architectures.
- Deep knowledge of Kubernetes, Docker, and CI/CD pipelines.
"""

def test_scoring():
    print("--- Case 1: Resume vs Data Analyst JD ---")
    sim1 = calculate_semantic_similarity(data_analyst_resume, data_analyst_jd)
    exp1 = calculate_experience_relevance(data_analyst_resume.split("EXPERIENCE")[1], data_analyst_jd)
    print(f"Similarity Score: {sim1} (Expected > 60)")
    print(f"Experience Score: {exp1}\n")

    print("--- Case 2: Resume vs Cloud Architect JD ---")
    sim2 = calculate_semantic_similarity(data_analyst_resume, cloud_architect_jd)
    exp2 = calculate_experience_relevance(data_analyst_resume.split("EXPERIENCE")[1], cloud_architect_jd)
    print(f"Similarity Score: {sim2} (Expected 20-40)")
    print(f"Experience Score: {exp2}\n")

if __name__ == "__main__":
    test_scoring()

