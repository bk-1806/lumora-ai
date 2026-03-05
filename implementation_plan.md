# Implementation Plan for Lumora AI UI

## Context
The user has provided a new dashboard UI (Lumora AI) built with Next.js and shadcn/ui. We need to integrate this UI into the existing `frontend` application while preserving the current backend connectivity and functionality. In addition, we need to improve backend keyword extraction and resume section formatting.

## Proposed Changes

### 1. Backend Improvements
- **Keyword Detection Logic**: Update the backend algorithm (likely in `scoring` or `parsing` modules) to normalize keywords:
  - Convert everything to lowercase.
  - Apply lemmatization to handle variations (e.g., using `nltk` or `spaCy`).
  - Ignore generic stop words (`engineer`, `experience`, `work`, etc.).
  - Remove duplicates from the extracted keywords list to improve matching accuracy.
- **Resume Optimization Strictness**: Update the prompt or logic generating the `optimized_resume_text` to strictly place `structured_resume["skills"]` in the SKILLS section and `structured_resume["certifications"]` in the CERTIFICATIONS section, ensuring they do not bleed into each other.

### 2. Frontend Dependencies and Configuration Updates
- Add missing dependencies from `lumora-ui/package.json` to `frontend/package.json` (`lucide-react`, `@radix-ui/react-*`, `class-variance-authority`, `clsx`, `tailwind-merge`, etc.) and install them.
- Copy `components.json`, `styles`, and any `tailwind.config` / `globals.css` required by the new UI components.
- Copy UI component directories (`components/`, `lib/`, `hooks/`) to `frontend/src/`.

### 3. TypeScript Interfaces for Type Safety
- Create `types.ts` or `types/index.ts` containing the shared interface based on the backend response:
  ```typescript
  export interface AnalysisResult {
    final_ats_score: number;
    keyword_score: number;
    similarity_score: number;
    experience_score: number;
    quantification_score: number;
    skill_density: number;
    formatting_score: number;
    missing_keywords: string[];
    strengths: string[];
    weaknesses: string[];
    interview_questions: string[];
    optimized_resume_text: string;
    cover_letter: string;
  }
  ```
- Use this `AnalysisResult` type for props across the dashboard components.

### 4. Integrating the Dashboard Route (`frontend/src/app/dashboard`)
- Apply the new `DashboardPage` layout using the copied components.
- **Data Mapping**:
  - Map `result.missing_keywords` to the **SkillGapAnalysis** component.
  - Update the **ATS Score Panel** & **Radar** to show strictly: Final ATS Score, Keyword Match Score, Semantic Similarity Score, Experience Relevance Score, Quantification Score, Skill Density Score, and Formatting Score. Do *not* use `pass_probability`.
  - **ResumeCopilot**: Update the component design to the new Lumora AI style while ensuring it continues to call `http://localhost:8000/api/copilot-chat` internally, keeping the conversation history flowing exactly as before.

## Verification Plan
1. Start the API server and examine backend logs to ensure semantic extraction and stop-word filtering works efficiently.
2. Render the frontend `npm run dev` and upload a sample resume.
3. Validate that the new UI components map the backend JSON perfectly using the new interface.
4. Verify that the Copilot continues to function successfully.
5. Check the generated Optimized Resume output to ensure Certifications strictly stay in the Certifications bucket and don't mix into Skills.
