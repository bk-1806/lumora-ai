# Lumora AI

**AI-powered resume intelligence platform** that analyzes resumes against job descriptions, generates ATS scores, skill gap insights, interview preparation questions, and optimized resume suggestions.

---

## 🚀 Features

- **ATS Score Analysis** – Deep scoring across keyword match, semantic similarity, experience, quantification, and formatting
- **Skill Gap Detection** – Identifies missing keywords from the job description
- **Resume Optimization** – AI-rewrites weak bullet points and generates an enhanced resume
- **Cover Letter Generation** – Auto-generates a tailored cover letter
- **Interview Preparation** – Generates targeted interview questions based on the role
- **Resume Copilot** – Live AI chat to refine your resume interactively
- **Resume History** – Stores and retrieves past analysis sessions from a Supabase database
- **Dashboard Search** – Search across all analysis sections with live highlighting

---

## 🧱 Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **Tailwind CSS** + **shadcn/ui**
- **Recharts** for radar/bar chart analytics
- **Prisma v6** ORM with **Supabase (PostgreSQL)**

### Backend
- **FastAPI** (Python)
- **spaCy** for NLP keyword extraction
- **Google Gemini** for LLM-based resume optimization
- **sentence-transformers** for semantic similarity scoring

---

## 📁 Project Structure

```
lumora-ai/
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/            # Pages and API routes
│   │   ├── components/     # Dashboard and UI components
│   │   ├── context/        # SearchContext
│   │   ├── lib/            # Prisma singleton
│   │   └── types.ts        # Shared TypeScript interfaces
│   ├── prisma/             # Prisma schema
│   └── public/             # Static assets (Lumora logo)
└── backend/                # FastAPI application
    ├── app/
    │   ├── api/            # Endpoints (/analyze, /copilot-chat)
    │   ├── nlp/            # Keyword extraction (spaCy)
    │   ├── llm/            # Gemini LLM engine
    │   ├── parsers/        # PDF/DOCX resume parsers
    │   └── services/       # Core analysis pipeline
    └── requirements.txt
```

---

## ⚙️ Setup

### Prerequisites
- Node.js 20+, Python 3.10+, Git

### 1. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env       # Add your DATABASE_URL and API URL
npx prisma migrate dev --name init
npm run dev
```

### 3. Environment Variables
Create `frontend/.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/postgres"
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

---

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) or [Railway](https://railway.app) |
| Database | [Supabase](https://supabase.com) PostgreSQL |

---

## 📄 License

MIT
