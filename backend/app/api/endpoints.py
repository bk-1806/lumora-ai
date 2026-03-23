from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.analysis_service import process_resume_analysis
from app.llm.copilot import chat_with_copilot
from app.db import db_client

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Existing: Resume Analysis Endpoint
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    email: str = Form(...),
):
    """
    Upload a resume and job description to get full ATS analysis.
    """
    user_id = email
    user = db_client.get_user(user_id)
    if not user:
        user = db_client.create_user(email)

    can_scan = db_client.update_scan_count(user["id"])
    if not can_scan:
        raise HTTPException(
            status_code=429,
            detail="Daily scan limit of 2 exceeded. Please upgrade for more.",
        )

    try:
        contents = await resume.read()
        result = process_resume_analysis(
            user_id=user["id"],
            resume_bytes=contents,
            resume_filename=resume.filename,
            jd_text=job_description,
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# New: Resume Copilot Chat Endpoint
# ─────────────────────────────────────────────────────────────────────────────

class CopilotMessage(BaseModel):
    role: str    # "user" | "assistant"
    content: str


class CopilotChatRequest(BaseModel):
    """
    Request body for the copilot chat endpoint.

    The frontend passes the full analysis context directly (since the mock DB
    is in-memory and results won't persist across server restarts).
    """
    user_message: str
    conversation_history: Optional[List[CopilotMessage]] = []

    # Full analysis context — passed directly from localStorage on the frontend
    resume_text: Optional[str] = ""
    jd_text: Optional[str] = ""
    keyword_score: Optional[float] = 0
    similarity_score: Optional[float] = 0
    experience_score: Optional[float] = 0
    skill_density: Optional[float] = 0
    final_ats_score: Optional[float] = 0
    pass_probability: Optional[float] = 0
    skill_gap: Optional[List[str]] = []
    strengths: Optional[List[str]] = []
    weaknesses: Optional[List[str]] = []
    missing_keywords: Optional[List[str]] = []


@router.post("/copilot-chat")
async def copilot_chat(request: CopilotChatRequest):
    """
    Resume Copilot Chat — AI assistant with full analysis context.

    Accepts the user's message + conversation history + analysis context.
    Returns a structured, actionable AI response.
    """
    try:
        context = {
            "resume_text":      request.resume_text,
            "jd_text":          request.jd_text,
            "keyword_score":    request.keyword_score,
            "similarity_score": request.similarity_score,
            "experience_score": request.experience_score,
            "skill_density":    request.skill_density,
            "final_ats_score":  request.final_ats_score,
            "pass_probability": request.pass_probability,
            "skill_gap":        request.skill_gap,
            "strengths":        request.strengths,
            "weaknesses":       request.weaknesses,
            "missing_keywords": request.missing_keywords,
        }

        history = [
            {"role": msg.role, "content": msg.content}
            for msg in (request.conversation_history or [])
        ]

        answer = chat_with_copilot(
            user_message=request.user_message,
            context=context,
            conversation_history=history,
        )

        return {"status": "success", "response": answer}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# New: History and Versions Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/resume-history")
async def get_resume_history(email: Optional[str] = None):
    history = db_client.get_analysis_history(email)
    return {"status": "success", "data": history}

@router.get("/resume-versions")
async def get_resume_versions(email: Optional[str] = None):
    versions = db_client.get_resume_versions(email)
    return {"status": "success", "data": versions}

@router.post("/resume-version")
async def save_resume_version(data: dict):
    email = data.get("email", "unknown")
    version = db_client.save_resume_version(email, data)
    return {"status": "success", "data": version}
