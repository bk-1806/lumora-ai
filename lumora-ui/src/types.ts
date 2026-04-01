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
    _resume_text?: string;
    resume_text?: string;
    job_description?: string;
    pass_probability?: number;
    skill_gap?: string[];
    before_score?: number;
    after_score?: number;
    improvement_percentage?: number;
    improved_bullets?: Record<string, string>;
}
