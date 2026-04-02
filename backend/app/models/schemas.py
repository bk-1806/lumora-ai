from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ConversationMessage(BaseModel):
    role: str
    content: str

class CopilotChatRequest(BaseModel):
    user_message: str
    resume_text: str
    jd_text: str
    keyword_score: float
    similarity_score: float
    experience_score: float
    skill_density: float
    final_ats_score: float
    pass_probability: float
    skill_gap: List[str]
    strengths: List[str]
    weaknesses: List[str]
    missing_keywords: List[str]
    conversation_history: Optional[List[ConversationMessage]] = None

class InterviewPrepRequest(BaseModel):
    resume_text: str
    jd_text: str

class SaveAnalysisRequest(BaseModel):
    user_id: str
    filename: str
    label: str
    resume_text: str
    job_description: str
    analysis_data: Dict[str, Any]
