"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Plus } from "lucide-react"
import { AnalysisResult } from "@/types"

/*
  "Machine Learning",
  "Docker",
  "CI/CD",
  "Kubernetes",
  "Agile",
  "Microservices",
  "GraphQL",
  "TypeScript",
  "Data Pipeline",
  "Cloud Architecture",
  "REST API",
*/

export function SkillGapAnalysis({ result, searchQuery = "" }: { result: AnalysisResult; searchQuery?: string }) {
  const missingKeywords = result.missing_keywords || [];
  return (
    <Card
      className="border-white bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(168,85,247,0.06)] rounded-3xl"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Target className="size-4 text-amber-500" />
          Skill Gap Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-5 text-sm text-slate-500">
          Missing keywords from the job description. Add these to improve your ATS score.
        </p>
        <div className="flex flex-wrap gap-2">
          {missingKeywords.map((keyword) => {
            const isMatch = searchQuery && keyword.toLowerCase().includes(searchQuery.toLowerCase())
            return (
              <button
                key={keyword}
                className={`group flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 shadow-sm ${isMatch ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-white bg-white/50 text-slate-600 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700'}`}
              >
                <span>{keyword}</span>
                <Plus className={`size-3 transition-colors ${isMatch ? 'text-amber-600' : 'text-slate-400 group-hover:text-purple-600'}`} />
              </button>
            )
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-5 rounded-xl gap-2 border-purple-200 bg-white/50 text-purple-600 shadow-sm hover:bg-purple-50 hover:text-purple-700 transition-all font-semibold"
        >
          <Plus className="size-3.5" />
          Add All to Resume
        </Button>
      </CardContent>
    </Card>
  )
}
