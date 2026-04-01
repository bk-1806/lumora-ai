"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle } from "lucide-react"
import { AnalysisResult } from "@/types"

/*
  "Strong quantification of achievements with metrics",
  "Excellent use of action verbs throughout experience",
  "Skills section well-organized with relevant technologies",
  "Education section properly formatted",
  "Professional summary effectively communicates value proposition",
]

const improvements = [
  "Add more industry-specific keywords for cloud computing",
  "Include certifications section to boost credibility",
  "Expand project descriptions with measurable outcomes",
  "Add leadership experience or management responsibilities",
*/

function highlightText(text: string, query: string) {
  if (!query) return <span>{text}</span>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </span>
  )
}

export function ResumeAnalysis({ result, searchQuery = "" }: { result: AnalysisResult; searchQuery?: string }) {
  const strengths = result.strengths || [];
  const improvements = result.weaknesses || [];
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Strengths */}
      <Card
        className="border-white bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(168,85,247,0.06)] rounded-3xl"
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <CheckCircle2 className="size-4 text-green-500" />
            Resume Strengths
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {strengths.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50/50 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            >
              <div className="mt-1 size-2 shrink-0 rounded-full bg-green-500" />
              <p className="text-sm font-medium leading-relaxed text-slate-700">{highlightText(item, searchQuery)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Areas to Improve */}
      <Card
        className="border-white bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(168,85,247,0.06)] rounded-3xl"
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <AlertTriangle className="size-4 text-amber-500" />
            Weaknesses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {improvements.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            >
              <div className="mt-1 size-2 shrink-0 rounded-full bg-amber-500" />
              <p className="text-sm font-medium leading-relaxed text-slate-700">{highlightText(item, searchQuery)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
