import os

# ---------------------------------------------------
# Deployment Safety (Railway / Serverless Environments)
# ---------------------------------------------------
# Force HuggingFace and SentenceTransformers to use the writable /tmp directory
# to prevent "OSError: [Errno 30] Read-only file system" crashes during deployment boots.
os.environ["HF_HOME"] = "/tmp/huggingface"
os.environ["SENTENCE_TRANSFORMERS_HOME"] = "/tmp/st"
os.makedirs("/tmp/huggingface", exist_ok=True)
os.makedirs("/tmp/st", exist_ok=True)

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ResumeAI API",
    description="Intelligent ATS Simulation & Career Alignment Engine",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (e.g., Vercel frontend)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the ResumeAI API"}

from app.api import endpoints
from app.routers import auth

# Include routers
app.include_router(endpoints.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
