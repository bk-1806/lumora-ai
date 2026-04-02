from fastapi import APIRouter, HTTPException
from app.db.supabaseClient import get_supabase
from app.models.schemas import SaveAnalysisRequest

router = APIRouter(tags=["Authenticated Access"])

def _get_client():
    """Get Supabase client or raise 503 with a clear message."""
    try:
        client = get_supabase()
        if client is None:
            raise ValueError("Supabase client is None after initialization.")
        return client
    except Exception as e:
        print(f"ERROR: Supabase client unavailable: {e}")
        raise HTTPException(
            status_code=503,
            detail="Database unavailable. Check SUPABASE_URL and SUPABASE_KEY (service role key) on Render."
        )


@router.post("/save-analysis")
async def save_user_analysis(payload: SaveAnalysisRequest):
    """
    Save the analysis results mapped to the authenticated user's ID.
    Requires Supabase user_id (UUID from Supabase Auth).
    """
    print(f"[save-analysis] Incoming request — user_id: {payload.user_id}, label: {payload.label}")
    print(f"[save-analysis] ATS score: {payload.analysis_data.get('final_ats_score', 'N/A')}")

    db = _get_client()

    try:
        # 1. First ensure the resume is saved
        resume_insert = {
            "user_id": payload.user_id,
            "filename": payload.filename,
            "label": payload.label,
            "content_text": payload.resume_text,
        }
        print(f"[save-analysis] Inserting into 'resumes': {list(resume_insert.keys())}")
        resume_res = db.table("resumes").insert(resume_insert).execute()

        if not resume_res.data:
            print(f"[save-analysis] ERROR: resumes insert returned no data. Response: {resume_res}")
            raise HTTPException(status_code=500, detail="Failed to save resume — check Supabase RLS policies.")

        resume_id = resume_res.data[0]["id"]
        print(f"[save-analysis] Resume saved. resume_id: {resume_id}")

        # 2. Extract values for resume_analysis table
        db_payload = {
            "user_id": payload.user_id,
            "resume_id": resume_id,
            "job_description": payload.job_description,
            "resume_name": payload.label,
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
            "analysis_data": payload.analysis_data,  # Store full result as JSONB
        }

        print(f"[save-analysis] Inserting into 'resume_analysis'...")
        analysis_res = db.table("resume_analysis").insert(db_payload).execute()

        if not analysis_res.data:
            print(f"[save-analysis] ERROR: resume_analysis insert returned no data. Response: {analysis_res}")
            raise HTTPException(status_code=500, detail="Failed to save analysis — check Supabase RLS policies.")

        analysis_id = analysis_res.data[0]["id"]
        print(f"[save-analysis] Analysis saved successfully. analysis_id: {analysis_id}")
        return {"status": "success", "message": "Analysis saved to Supabase", "analysis_id": analysis_id}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[save-analysis] UNHANDLED ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/resume-history")
async def get_resume_history(user_id: str):
    """
    Fetch all analysis history for a given user.
    Returns rows shaped for the frontend ResumeVersions component.
    """
    print(f"[resume-history] Fetching history for user_id: {user_id}")

    if not user_id or user_id.strip() == "":
        raise HTTPException(status_code=400, detail="user_id is required.")

    db = _get_client()

    try:
        res = (
            db.table("resume_analysis")
            .select("id, user_id, resume_name, ats_score, analysis_data, created_at")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        print(f"[resume-history] Found {len(res.data)} records for user {user_id}")
        return {"status": "success", "data": res.data}
    except Exception as e:
        print(f"[resume-history] ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/resume-analysis/{analysis_id}")
async def delete_resume_analysis(analysis_id: str, user_id: str):
    """
    Delete a specific analysis. Requires matching user_id.
    """
    print(f"[delete-analysis] Deleting analysis_id: {analysis_id} for user_id: {user_id}")
    db = _get_client()
    try:
        db.table("resume_analysis").delete().eq("id", analysis_id).eq("user_id", user_id).execute()
        return {"status": "success", "message": "Analysis deleted."}
    except Exception as e:
        print(f"[delete-analysis] ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
