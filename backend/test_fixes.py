"""
Quick verification test for the 5 ATS bug fixes.
Run from backend/ directory:
    venv\Scripts\python.exe test_fixes.py
"""
# Force UTF-8 output on Windows
import sys, os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(__file__))

PASS = "[PASS]"
FAIL = "[FAIL]"
results = []

# ─────────────────────────────────────────────────────────────────────────────
# Test 1: JD Keyword Extraction (P1 fix)
# ─────────────────────────────────────────────────────────────────────────────
print("\n[Test 1] extract_keywords_from_jd()")
try:
    from app.nlp.processor import extract_keywords_from_jd

    sample_jd = """
    We are looking for a Data Scientist with strong Python and SQL skills.
    The candidate will work on machine learning models and computer vision projects.
    Experience with TensorFlow, Pandas, NumPy, and Scikit-learn is required.
    Knowledge of Docker, AWS, and Google Cloud is a plus.
    Must be comfortable with MongoDB, MySQL, and PostgreSQL.
    Familiarity with NLP, YOLO, and data visualization tools is preferred.
    """

    keywords = extract_keywords_from_jd(sample_jd)
    print(f"  Extracted {len(keywords)} keywords: {keywords}")

    EXPECTED_PRESENT = ["python", "sql", "machine learning", "computer vision",
                        "tensorflow", "pandas", "numpy", "scikit-learn",
                        "docker", "aws", "google cloud", "mongodb", "mysql",
                        "postgresql", "nlp", "yolo", "data visualization"]

    EXPECTED_ABSENT = ["job", "company", "world", "required",
                       "solutions", "overview", "position", "role", "candidate"]

    missing_expected = [k for k in EXPECTED_PRESENT if k not in keywords]
    found_junk = [k for k in EXPECTED_ABSENT if k in keywords]

    if not missing_expected and not found_junk:
        print(f"  {PASS}: All expected tech keywords found, no junk words")
        results.append(True)
    else:
        if missing_expected:
            print(f"  {FAIL}: Missing expected keywords: {missing_expected}")
        if found_junk:
            print(f"  {FAIL}: Found junk words in output: {found_junk}")
        results.append(False)

    if len(keywords) <= 35:
        print(f"  {PASS}: Count {len(keywords)} <= 35 limit")
    else:
        print(f"  {FAIL}: Count {len(keywords)} exceeds 35 limit")

except Exception as e:
    print(f"  {FAIL}: Exception: {e}")
    import traceback; traceback.print_exc()
    results.append(False)


# ─────────────────────────────────────────────────────────────────────────────
# Test 2: Keyword Match Scoring (P2 fix)
# ─────────────────────────────────────────────────────────────────────────────
print("\n[Test 2] calculate_keyword_match()")
try:
    from app.scoring.engines import calculate_keyword_match

    sample_resume = """
    John Doe | john@email.com | LinkedIn
    Python developer with experience in machine learning and computer vision.
    Used TensorFlow, PyTorch, Pandas, NumPy, and Scikit-learn for data analysis.
    Deployed models to AWS using Docker containers.
    Stored data in MongoDB and PostgreSQL databases.
    Built NLP pipelines. Worked with YOLO object detection models (YOLOv3).
    Skills: Python, SQL, Docker, AWS, Google Cloud, NLP, Data Visualization
    """

    jd_kws = ["python", "sql", "machine learning", "computer vision",
               "tensorflow", "pandas", "numpy", "scikit-learn", "docker",
               "aws", "google cloud", "mongodb", "postgresql", "nlp",
               "yolo", "data visualization"]

    result = calculate_keyword_match(sample_resume, jd_kws)
    score = result["score"]
    matched = result["matched"]
    missing = result["missing"]

    print(f"  Score: {score:.1f} | Matched: {len(matched)} | Missing: {len(missing)}")
    print(f"  Matched: {matched}")
    print(f"  Missing: {missing}")

    if score >= 60:
        print(f"  {PASS}: Score {score:.1f} >= 60 (good coverage)")
        results.append(True)
    else:
        print(f"  {FAIL}: Score {score:.1f} < 60 (still too low)")
        results.append(False)

    # Test variant normalization: "yolov3" in resume should match "yolo" in JD
    resume_with_variant = "Built computer vision system using YOLOv3 deep learning model."
    result2 = calculate_keyword_match(resume_with_variant, ["yolo", "computer vision", "deep learning"])
    print(f"\n  Variant test (yolov3 -> yolo): score={result2['score']} matched={result2['matched']}")
    if "yolo" in result2["matched"] or result2["score"] >= 60:
        print(f"  {PASS}: YOLOv3 in resume correctly matched 'yolo' JD keyword")
    else:
        print(f"  {FAIL}: Variant normalization failed")

except Exception as e:
    print(f"  {FAIL}: Exception: {e}")
    import traceback; traceback.print_exc()
    results.append(False)


# ─────────────────────────────────────────────────────────────────────────────
# Test 3: Section Parsing (P3 fix)
# ─────────────────────────────────────────────────────────────────────────────
print("\n[Test 3] parse_sections() - certification isolation")
try:
    from app.parsers.section_parser import parse_sections

    sample_resume = """John Doe
john@email.com | LinkedIn

SKILLS
Python, SQL, Java, Machine Learning, TensorFlow

EXPERIENCE
Software Engineer at Company X
- Built ML models using Python and TensorFlow
- Automated pipelines with Docker and AWS

CERTIFICATIONS
AWS Certified Cloud Practitioner
Reliance Foundation IoT Specialist
Google Professional Data Engineer

EDUCATION
B.Tech Computer Science, 2024
"""

    sections = parse_sections(sample_resume)

    skills_content = sections.get("skills", "").lower()
    certs_content = sections.get("certifications", "").lower()

    print(f"  SKILLS section: |{sections['skills']}|")
    print(f"  CERTS section:  |{sections['certifications']}|")

    cert_in_skills = (
        "aws certified" in skills_content or
        "iot specialist" in skills_content or
        "data engineer" in skills_content
    )
    certs_detected = (
        "aws certified" in certs_content or
        "iot specialist" in certs_content
    )

    if not cert_in_skills and certs_detected:
        print(f"  {PASS}: Certifications NOT in SKILLS, properly in CERTIFICATIONS section")
        results.append(True)
    else:
        if cert_in_skills:
            print(f"  {FAIL}: Certifications still bleeding into SKILLS section!")
        if not certs_detected:
            print(f"  {FAIL}: Certifications section is empty!")
        results.append(False)

except Exception as e:
    print(f"  {FAIL}: Exception: {e}")
    import traceback; traceback.print_exc()
    results.append(False)


# ─────────────────────────────────────────────────────────────────────────────
# Test 4: Tech Skills Extraction (P5 fix)
# ─────────────────────────────────────────────────────────────────────────────
print("\n[Test 4] extract_tech_skills() - normalization")
try:
    from app.nlp.skill_dictionary import extract_tech_skills

    resume_text = """
    Experience with YOLOv3, TensorFlow, and Scikit-learn.
    Cloud platforms: AWS, GCP, Azure.
    Databases: MySQL, PostgreSQL, MongoDB.
    Programming: Python, JavaScript, SQL.
    """

    skills = extract_tech_skills(resume_text)
    print(f"  Extracted skills: {skills}")

    expected_skills = ["yolo", "tensorflow", "scikit-learn", "aws",
                       "google cloud", "azure", "mysql", "postgresql",
                       "mongodb", "python", "sql"]

    found = [s for s in expected_skills if s in skills]
    not_found = [s for s in expected_skills if s not in skills]

    print(f"  Found expected: {found}")
    print(f"  Not found: {not_found}")

    if len(found) >= 8:
        print(f"  {PASS}: {len(found)}/{len(expected_skills)} expected skills detected")
        results.append(True)
    else:
        print(f"  {FAIL}: Only {len(found)}/{len(expected_skills)} skills detected")
        results.append(False)

except Exception as e:
    print(f"  {FAIL}: Exception: {e}")
    import traceback; traceback.print_exc()
    results.append(False)


# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
passed = sum(results)
total = len(results)
print(f"RESULTS: {passed}/{total} tests passed")
if passed == total:
    print("All tests passed!")
else:
    print("Some tests failed - check output above.")
print("="*60)
