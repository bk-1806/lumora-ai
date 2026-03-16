import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const latest = await prisma.analysisResult.findFirst({
            orderBy: { createdAt: "desc" },
        });

        if (!latest) {
            return NextResponse.json({ data: null }, { status: 404 });
        }

        // Map back to frontend AnalysisResult shape
        const result = {
            final_ats_score: latest.atsScore,
            keyword_score: latest.keywordScore,
            similarity_score: latest.similarityScore,
            experience_score: latest.experienceScore,
            quantification_score: latest.quantificationScore,
            skill_density: latest.skillDensity,
            formatting_score: latest.formattingScore,
            strengths: latest.strengths as string[],
            weaknesses: latest.weaknesses as string[],
            missing_keywords: latest.missingKeywords as string[],
            interview_questions: latest.interviewQuestions as string[],
            optimized_resume_text: latest.optimizedResume,
            cover_letter: latest.coverLetter,
        };

        return NextResponse.json({ data: result });
    } catch (err: any) {
        console.error("latest-analysis error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
