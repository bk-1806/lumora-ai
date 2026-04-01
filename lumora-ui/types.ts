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
