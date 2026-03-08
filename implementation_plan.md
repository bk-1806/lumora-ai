# Goal Description
Audit and upgrade Lumora AI full stack project to fix ATS engine calculations (specifically 0% metrics), fix the Resume Copilot server connection, add Resume Versions, Resume History, Analysis Notifications, and a Profile Menu.

## User Review Required
None of these changes look like they will negatively impact the current flow. However, because Railway environment restrictions were mentioned, removing `cache_folder` for the `SentenceTransformer` is proposed so it gracefully loads the model in memory.

## Proposed Changes

### Backend Changes (`backend/`)

#### [MODIFY] `backend/app/scoring/engines.py`
- **Fix 0% Similarity/Experience bugs**: Remove early `if not similarity_model` check in `calculate_semantic_similarity` so it safely invokes `get_embedding` to lazily load the model.
- **Enable Lazy Loading**: Update `SentenceTransformer("all-MiniLM-L6-v2")` to remove the local cache folder parameter to prevent Railway startup IO errors.

#### [MODIFY] `backend/app/api/endpoints.py`
- **Add `GET /api/resume-history`**: Return list of user's previous uploads, ATS score, and upload date.
- **Add `POST /api/resume-version` & `GET /api/resume-versions`**: Endpoints to save and fetch versions (id, timestamp, resume_text, ats_score, metrics).

#### [MODIFY] `backend/app/db/mock_client.py`
- Add in-memory support/queries to handle retrieving and adding to `resume_history` and `resume_versions`.

---

### Frontend Changes (`frontend/`)

#### [MODIFY] `frontend/src/components/dashboard/resume-copilot.tsx`
- Ensure fetch path uses dynamic URL: `const API = process.env.NEXT_PUBLIC_API_URL` instead of `http://localhost:8000`.
- Verify body JSON and Chat context logic.

#### [MODIFY] `frontend/src/components/dashboard/resume-history.tsx`
- Update endpoint to use `process.env.NEXT_PUBLIC_API_URL` and point to the new `/api/resume-history` backend endpoint instead of the undefined `/api/analysis-history`.

#### [NEW] `frontend/src/components/dashboard/resume-versions.tsx`
- Create a UI list rendering previous versions, ATS scores, and timestamps.

#### [MODIFY] `frontend/src/app/dashboard/page.tsx`
- Wire the new `<ResumeVersions />` child component into the dashboard flow on the frontend.

#### [MODIFY] `frontend/src/components/dashboard/top-header.tsx`
- **Profile Menu**: Add a drop-down menu on the Avatar showing quick stats (name, email, uploads, avg score) and links (Profile, Settings, History, Logout).
- **Notification**: Update the Bell icon style dynamically to show when a new analysis completes.

#### [MODIFY] `frontend/src/app/upload/page.tsx`
- Render a notification/toast block matching "Resume analysis completed successfully." when upload resolves.

## Verification Plan

### Manual Verification
1. Run backend (`uvicorn main:app`) and frontend (`npm run dev`) locally.
2. Upload a sample resume + JD via the UI. Ensure a success notification appears on completion.
3. Check **Semantic Similarity** and **Experience Relevance** metrics on the dashboard (should be > 0).
4. Send a prompt to the **Resume Copilot**; verify it responds.
5. Open the **Profile Icon** (Top Right) to ensure dropdown items reflect user basic metrics.
6. Verify **Resume Versions** block displays the analysis data.
7. Click **Resume History** context to ensure it renders previous uploads correctly.
