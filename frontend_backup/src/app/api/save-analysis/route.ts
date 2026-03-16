import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const saved = await prisma.analysisResult.create({
            data: {
                atsScore: body.final_ats_score ?? 0,
                keywordScore: body.keyword_score ?? 0,
                similarityScore: body.similarity_score ?? 0,
                experienceScore: body.experience_score ?? 0,
                quantificationScore: body.quantification_score ?? 0,
                skillDensity: body.skill_density ?? 0,
                formattingScore: body.formatting_score ?? 0,
                strengths: body.strengths ?? [],
                weaknesses: body.weaknesses ?? [],
                missingKeywords: body.missing_keywords ?? [],
                interviewQuestions: body.interview_questions ?? [],
                optimizedResume: body.optimized_resume_text ?? "",
                coverLetter: body.cover_letter ?? "",
                resumeName: body.resume_name ?? null,
            },
        });

        return NextResponse.json({ success: true, id: saved.id });
    } catch (err: any) {
        console.error("save-analysis error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
