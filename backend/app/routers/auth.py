"""
Auth router: Save analysis and fetch resume history via Supabase.

Endpoints:
- POST /api/auth/save-analysis
- GET  /api/auth/resume-history?user_id=
"""
from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db.supabase_client import get_supabase

router = APIRouter()

TABLE = "analysis_history"


# ─────────────────────────────────────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────────────────────────────────────

class SaveAnalysisRequest(BaseModel):
    user_id: Optional[str] = None      # user.email from Supabase Auth
    resume_name: Optional[str] = None
    ats_score: Optional[float] = None
    analysis_data: Optional[Dict[str, Any]] = None


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/save-analysis
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/save-analysis")
async def save_analysis(body: SaveAnalysisRequest):
    # Validation
    if not body.resume_name or body.resume_name.strip() == "":
        raise HTTPException(status_code=400, detail="resume_name is required")
    if body.ats_score is None:
        raise HTTPException(status_code=400, detail="ats_score is required")

    client = get_supabase()
    if client is None:
        raise HTTPException(status_code=503, detail="Database unavailable — Supabase not configured")

    try:
        record = {
            "user_id": body.user_id or "anonymous",
            "resume_name": body.resume_name.strip(),
            "ats_score": body.ats_score,
            "analysis_data": body.analysis_data or {},
            "created_at": datetime.utcnow().isoformat(),
        }
        result = client.table(TABLE).insert(record).execute()
        return {"status": "success", "data": result.data}
    except Exception as e:
        print(f"[save-analysis] ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/auth/resume-history?user_id=
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/resume-history")
async def get_resume_history(user_id: Optional[str] = None):
    # Safety: no user_id → return empty list (no crash)
    if not user_id or user_id.strip() == "":
        return {"status": "success", "data": []}

    client = get_supabase()
    if client is None:
        # Graceful degradation — return empty list, don't crash
        return {"status": "success", "data": []}

    try:
        result = (
            client.table(TABLE)
            .select("id, user_id, resume_name, ats_score, analysis_data, created_at")
            .eq("user_id", user_id.strip())
            .order("created_at", desc=True)
            .execute()
        )
        return {"status": "success", "data": result.data or []}
    except Exception as e:
        print(f"[resume-history] ERROR: {e}")
        # Return empty list on error rather than 500 crash
        return {"status": "success", "data": []}
