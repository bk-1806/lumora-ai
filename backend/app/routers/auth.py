from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from app.db.supabaseClient import db_client
from app.models.schemas import SaveAnalysisRequest

router = APIRouter(tags=["Authenticated Access"])

@router.post("/save-analysis")
async def save_user_analysis(payload: SaveAnalysisRequest):
    """
    Save the analysis results mapped to the authenticated user's ID.
    Requires Supabase user_id.
    """
    try:
        # 1. First ensure the resume is saved
        resume_res = db_client.table("resumes").insert({
            "user_id": payload.user_id,
            "filename": payload.filename,
            "label": payload.label,
            "content_text": payload.resume_text
        }).execute()
        
        if not resume_res.data:
            raise HTTPException(status_code=500, detail="Failed to save resume")
        
        resume_id = resume_res.data[0]['id']

        # 2. Extract values for resume_analysis table
        db_payload = {
            "user_id": payload.user_id,
            "resume_id": resume_id,
            "job_description": payload.job_description,
            "ats_score": payload.analysis_data.get("final_ats_score", 0),
            "keyword_score": payload.analysis_data.get("keyword_score", 0),
            "similarity_score": payload.analysis_data.get("similarity_score", 0),
            "experience_score": payload.analysis_data.get("experience_score", 0),
            "skill_density": payload.analysis_data.get("skill_density", 0),
            "pass_probability": payload.analysis_data.get("pass_probability", 0),
            "strengths": payload.analysis_data.get("strengths", []),
            "weaknesses": payload.analysis_data.get("weaknesses", []),
            "missing_keywords": payload.analysis_data.get("missing_keywords", []),
            "skill_gap": payload.analysis_data.get("skill_gap", []),
            "raw_response": payload.analysis_data # Store as JSONB
        }

        analysis_res = db_client.table("resume_analysis").insert(db_payload).execute()
        
        if not analysis_res.data:
            raise HTTPException(status_code=500, detail="Failed to save analysis")

        return {"status": "success", "message": "Analysis saved to Supabase", "analysis_id": analysis_res.data[0]['id']}
    
    except Exception as e:
        print(f"ERROR saving analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/resume-history")
async def get_resume_history(user_id: str):
    """
    Fetch all analysis history for a given user.
    """
    try:
        res = db_client.table("resume_analysis").select("*, resumes(filename, label)").eq("user_id", user_id).order("created_at", desc=True).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/resume-analysis/{analysis_id}")
async def delete_resume_analysis(analysis_id: str, user_id: str):
    """
    Delete a specific analysis iteration. RLS ensures user_id matches.
    """
    try:
        db_client.table("resume_analysis").delete().eq("id", analysis_id).eq("user_id", user_id).execute()
        return {"status": "success", "message": "Analysis deleted."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
