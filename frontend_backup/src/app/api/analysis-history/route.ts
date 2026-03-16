import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const results = await prisma.analysisResult.findMany({
            orderBy: { createdAt: "desc" },
            take: 20,
            select: {
                id: true,
                atsScore: true,
                resumeName: true,
                createdAt: true,
                strengths: true,
                weaknesses: true,
                missingKeywords: true,
                interviewQuestions: true,
                optimizedResume: true,
                coverLetter: true,
                keywordScore: true,
                similarityScore: true,
                experienceScore: true,
                quantificationScore: true,
                skillDensity: true,
                formattingScore: true,
            },
        });

        const mapped = results.map((r: typeof results[number]) => ({
            id: r.id,
            ats_score: r.atsScore,
            resume_name: r.resumeName,
            created_at: r.createdAt.toISOString(),
            // Full result for loading into dashboard
            result: {
                final_ats_score: r.atsScore,
                keyword_score: r.keywordScore,
                similarity_score: r.similarityScore,
                experience_score: r.experienceScore,
                quantification_score: r.quantificationScore,
                skill_density: r.skillDensity,
                formatting_score: r.formattingScore,
                strengths: r.strengths as string[],
                weaknesses: r.weaknesses as string[],
                missing_keywords: r.missingKeywords as string[],
                interview_questions: r.interviewQuestions as string[],
                optimized_resume_text: r.optimizedResume,
                cover_letter: r.coverLetter,
            },
        }));

        return NextResponse.json({ data: mapped });
    } catch (err: any) {
        console.error("analysis-history error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
