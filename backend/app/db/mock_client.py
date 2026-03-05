from typing import Dict, Any, List
from datetime import datetime
import uuid

# Mock Database Store
mock_db = {
    "users": {},
    "resumes": {},
    "job_descriptions": {},
    "analysis_results": {}
}

class MockDBClient:
    def __init__(self):
        self.db = mock_db

    def create_user(self, email: str) -> Dict[str, Any]:
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "email": email,
            "daily_scan_count": 0,
            "last_scan_date": datetime.utcnow().date().isoformat(),
            "created_at": datetime.utcnow().isoformat()
        }
        self.db["users"][user_id] = user
        return user

    def get_user(self, user_id: str) -> Dict[str, Any]:
        return self.db["users"].get(user_id)

    def update_scan_count(self, user_id: str) -> bool:
        user = self.get_user(user_id)
        if not user:
            return False
            
        today = datetime.utcnow().date().isoformat()
        if user["last_scan_date"] != today:
            user["daily_scan_count"] = 1
            user["last_scan_date"] = today
        else:
            if user["daily_scan_count"] >= 2:
                return False # Rate limit exceeded
            user["daily_scan_count"] += 1
        return True

    def create_resume(self, user_id: str, raw_text: str, structured_data: Dict[str, Any]) -> Dict[str, Any]:
        resume_id = str(uuid.uuid4())
        resume = {
            "id": resume_id,
            "user_id": user_id,
            "raw_text": raw_text,
            "structured_data": structured_data
        }
        self.db["resumes"][resume_id] = resume
        return resume

    def create_job_description(self, raw_text: str, parsed_keywords: List[str]) -> Dict[str, Any]:
        jd_id = str(uuid.uuid4())
        jd = {
            "id": jd_id,
            "raw_text": raw_text,
            "parsed_keywords": parsed_keywords
        }
        self.db["job_descriptions"][jd_id] = jd
        return jd

    def save_analysis_result(self, resume_id: str, jd_id: str, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        result_id = str(uuid.uuid4())
        result = {
            "id": result_id,
            "resume_id": resume_id,
            "jd_id": jd_id,
            **analysis_data,
            "created_at": datetime.utcnow().isoformat()
        }
        self.db["analysis_results"][result_id] = result
        return result

# Singleton client instance
db_client = MockDBClient()
