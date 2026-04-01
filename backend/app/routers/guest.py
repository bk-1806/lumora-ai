from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from pydantic import ValidationError
from app.services.analysis_service import process_resume_analysis
from app.llm.copilot import chat_with_copilot
from app.models.schemas import CopilotChatRequest

router = APIRouter(tags=["Guest Use (No Auth Needed)"])

MAX_FILE_SIZE = 5 * 1024 * 1024 # 5 MB

@router.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    email: str = Form(None),
):
    """
    Guest Upload API: Upload a resume and job description to get full ATS analysis WITHOUT saving it.
    """
    print(f"Backend received /analyze request. File: {resume.filename}, Email: {email}")
    
    # File size validation
    contents = await resume.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

    # Restrict file type
    if resume.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    try:
        result = process_resume_analysis(
            resume_bytes=contents,
            resume_filename=resume.filename,
            jd_text=job_description,
        )
        
        result["job_description"] = job_description
        result["resume_text"] = result.pop("_resume_text", "")
        
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/copilot-chat")
async def copilot_chat(request: CopilotChatRequest):
    """
    Resume Copilot Chat — AI assistant with full analysis context.
    Works for guests as long as frontend passes the context in localStorage.
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

@router.post("/interview-prep")
async def generate_prep_questions(request: CopilotChatRequest):
    """
    Generate 5 tailored interview questions based on the candidate's resume and target JD.
    Reuses the CopilotChatRequest schema since it contains the needed text.
    """
    from app.llm.copilot import generate_interview_questions
    try:
        questions = generate_interview_questions(
            resume_text=request.resume_text,
            jd_text=request.jd_text
        )
        return {"status": "success", "data": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
