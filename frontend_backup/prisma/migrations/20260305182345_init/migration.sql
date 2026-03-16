-- CreateTable
CREATE TABLE "AnalysisResult" (
    "id" TEXT NOT NULL,
    "atsScore" DOUBLE PRECISION NOT NULL,
    "keywordScore" DOUBLE PRECISION NOT NULL,
    "similarityScore" DOUBLE PRECISION NOT NULL,
    "experienceScore" DOUBLE PRECISION NOT NULL,
    "quantificationScore" DOUBLE PRECISION NOT NULL,
    "skillDensity" DOUBLE PRECISION NOT NULL,
    "formattingScore" DOUBLE PRECISION NOT NULL,
    "strengths" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "missingKeywords" JSONB NOT NULL,
    "interviewQuestions" JSONB NOT NULL,
    "optimizedResume" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "resumeName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisResult_pkey" PRIMARY KEY ("id")
);
