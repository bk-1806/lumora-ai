"use client"

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { AnalysisResult } from '@/types'

import { Sidebar } from "@/components/dashboard/sidebar"
import { TopHeader } from "@/components/dashboard/top-header"
import { AtsScorePanel } from "@/components/dashboard/ats-score-panel"
import { ResumeMatchRadar } from "@/components/dashboard/resume-match-radar"
import { AnalysisMetrics } from "@/components/dashboard/analysis-metrics"
import { SkillGapAnalysis } from "@/components/dashboard/skill-gap-analysis"
import { ResumeAnalysis } from "@/components/dashboard/resume-analysis"
import { InterviewPrep } from "@/components/dashboard/interview-prep"
import { ResumeCopilot } from "@/components/dashboard/resume-copilot"
import { OptimizedResume } from "@/components/dashboard/optimized-resume"
import { ResumeVersions } from "@/components/dashboard/resume-versions"
import { SearchProvider, useSearch } from "@/context/search-context"

// Helper: does this section contain searchQuery?
function sectionMatches(texts: string[], query: string): boolean {
    if (!query) return true
    const q = query.toLowerCase()
    return texts.some(t => t?.toLowerCase().includes(q))
}

function DashboardContent({ result: initialResult }: { result: AnalysisResult }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [result, setResult] = useState<AnalysisResult>(initialResult)
    const { searchQuery } = useSearch()

    const tab = searchParams.get('tab')

    // When user picks from history
    const handleHistorySelect = (r: AnalysisResult) => {
        setResult(r)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    // Handle "Open Analysis" from ResumeVersions
    const handleOpenAnalysis = (r: AnalysisResult) => {
        setResult(r)
        router.push('/dashboard')
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    // Compute which sections are visible in search mode
    const skillGapVisible = sectionMatches(result.missing_keywords, searchQuery)
    const analysisVisible = sectionMatches([...result.strengths, ...result.weaknesses], searchQuery)
    const interviewVisible = sectionMatches(result.interview_questions, searchQuery)
    const resumeVisible = sectionMatches([result.optimized_resume_text, result.cover_letter], searchQuery)

    // Auto scroll to first match
    useEffect(() => {
        if (!searchQuery) return
        const ids = [
            { id: "skill-gap", visible: skillGapVisible },
            { id: "resume-analysis", visible: analysisVisible },
            { id: "interview-prep", visible: interviewVisible },
            { id: "optimized-resume", visible: resumeVisible },
        ]
        const first = ids.find(s => s.visible)
        if (first) {
            const el = document.getElementById(first.id)
            if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100)
        }
    }, [searchQuery, skillGapVisible, analysisVisible, interviewVisible, resumeVisible])

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#faf7ff] via-[#f3eeff] to-[#f8faff]">
            <Sidebar onHistorySelect={handleHistorySelect} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <TopHeader />

                {/* Search info banner */}
                {searchQuery && (
                    <div className="border-b border-border bg-primary/5 px-6 py-2 text-xs text-muted-foreground">
                        Showing sections matching <span className="font-semibold text-primary">&quot;{searchQuery}&quot;</span>
                        {" "}— {[skillGapVisible, analysisVisible, interviewVisible, resumeVisible].filter(Boolean).length} section(s) found
                    </div>
                )}

                <main className="flex-1 overflow-y-auto relative">
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04] z-0">
                        <Image
                            src="/lumora-logo.png"
                            alt="Lumora Background"
                            width={800}
                            height={800}
                            className="object-contain mix-blend-multiply grayscale"
                            priority
                        />
                    </div>
                    <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8 relative z-10">

                        {/* Resume Versions tab */}
                        {tab === 'resume-versions' ? (
                            <section id="resume-versions">
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-foreground">Resume History</h2>
                                    <p className="text-sm text-muted-foreground">View and manage your previously saved ATS analyses.</p>
                                </div>
                                <ResumeVersions onOpenAnalysis={handleOpenAnalysis} />
                            </section>
                        ) : (
                            <>
                                {/* Career Intelligence Score + Radar - always visible */}
                                <section id="dashboard">
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                                        <div className="lg:col-span-2">
                                            <AtsScorePanel result={result} />
                                        </div>
                                        <div className="lg:col-span-3">
                                            <ResumeMatchRadar result={result} />
                                        </div>
                                    </div>
                                </section>

                                {/* Analysis Metrics - always visible */}
                                <section>
                                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Analysis Metrics
                                    </h2>
                                    <AnalysisMetrics result={result} />
                                </section>

                                {/* Skill Gap Analysis */}
                                {skillGapVisible && (
                                    <section id="skill-gap">
                                        <SkillGapAnalysis result={result} searchQuery={searchQuery} />
                                    </section>
                                )}

                                {/* Resume Strengths & Weaknesses */}
                                {analysisVisible && (
                                    <section id="resume-analysis">
                                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Resume Strengths &amp; Weaknesses
                                        </h2>
                                        <ResumeAnalysis result={result} searchQuery={searchQuery} />
                                    </section>
                                )}

                                {/* Interview Prep + Copilot */}
                                <section>
                                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                        {interviewVisible && (
                                            <div id="interview-prep">
                                                <InterviewPrep result={result} searchQuery={searchQuery} />
                                            </div>
                                        )}
                                        <div id="resume-copilot">
                                            <ResumeCopilot result={result} />
                                        </div>
                                    </div>
                                </section>

                                {/* Optimized Resume */}
                                {resumeVisible && (
                                    <section id="optimized-resume">
                                        <OptimizedResume result={result} searchQuery={searchQuery} />
                                    </section>
                                )}
                            </>
                        )}

                    </div>
                </main>
            </div>
        </div>
    )
}

function DashboardLoader() {
    const router = useRouter()
    const [result, setResult] = useState<AnalysisResult | null>(null)

    useEffect(() => {
        const data = localStorage.getItem("analysis_result")
        if (!data) {
            // Don't redirect if we're on the resume-versions tab — allow unauthenticated view
            return
        }
        setResult(JSON.parse(data))
    }, [router])

    // Create a minimal placeholder result for the resume-versions tab when no analysis
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab')

    const placeholderResult: AnalysisResult = {
        final_ats_score: 0,
        keyword_score: 0,
        similarity_score: 0,
        experience_score: 0,
        quantification_score: 0,
        skill_density: 0,
        formatting_score: 0,
        missing_keywords: [],
        strengths: [],
        weaknesses: [],
        interview_questions: [],
        optimized_resume_text: "",
        cover_letter: "",
    }

    if (!result && tab !== 'resume-versions') {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#faf7ff] via-[#f3eeff] to-[#f8faff]">
                <div className="size-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
            </div>
        )
    }

    return (
        <SearchProvider>
            <DashboardContent result={result ?? placeholderResult} />
        </SearchProvider>
    )
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#faf7ff] via-[#f3eeff] to-[#f8faff]">
                <div className="size-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
            </div>
        }>
            <DashboardLoader />
        </Suspense>
    )
}
