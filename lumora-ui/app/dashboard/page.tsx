"use client"

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

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <TopHeader />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
            {/* Career Intelligence Score + Radar Chart */}
            <section>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="lg:col-span-2">
                  <AtsScorePanel />
                </div>
                <div className="lg:col-span-3">
                  <ResumeMatchRadar />
                </div>
              </div>
            </section>

            {/* Analysis Metrics */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Analysis Metrics
              </h2>
              <AnalysisMetrics />
            </section>

            {/* Skill Gap Analysis */}
            <section>
              <SkillGapAnalysis />
            </section>

            {/* Resume Strengths & Weaknesses */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Resume Strengths & Weaknesses
              </h2>
              <ResumeAnalysis />
            </section>

            {/* Interview Prep + Copilot */}
            <section>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <InterviewPrep />
                <ResumeCopilot />
              </div>
            </section>

            {/* Optimized Resume */}
            <section>
              <OptimizedResume />
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
