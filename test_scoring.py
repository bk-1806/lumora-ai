import sys
import os

sys.path.append("/Users/bhavankothalanka/lumora-ai/backend")
from app.scoring.engines import calculate_semantic_similarity, calculate_experience_relevance, fallback_semantic_similarity

resume_text = "I am an experienced ai engineer. I have worked on machine learning and artificial intelligence for 5 years."
jd_text = "ai engineer"

print("Resume Length:", len(resume_text))
print("JD Length:", len(jd_text))

sim1 = fallback_semantic_similarity(resume_text, jd_text)
print("TF-IDF Fallback Semantic Similarity:", sim1)

try:
    sim2 = calculate_semantic_similarity(resume_text, jd_text)
    print("Normal Semantic Similarity:", sim2)
except Exception as e:
    print("Normal Semantic Similarity error:", e)

exp_rel = calculate_experience_relevance(resume_text, jd_text)
print("Experience Relevance:", exp_rel)
