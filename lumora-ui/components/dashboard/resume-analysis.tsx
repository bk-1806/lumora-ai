"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle } from "lucide-react"

const strengths = [
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
  "Consider adding volunteer or open-source contributions",
]

export function ResumeAnalysis() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Strengths */}
      <Card
        className="border-border bg-card"
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle2 className="size-4 text-lumora-success" />
            Resume Strengths
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {strengths.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-lumora-success/15 bg-lumora-success/5 p-3"
            >
              <div className="mt-1 size-1.5 shrink-0 rounded-full bg-lumora-success" />
              <p className="text-sm leading-relaxed text-foreground">{item}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Areas to Improve */}
      <Card
        className="border-border bg-card"
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="size-4 text-lumora-warning" />
            Weaknesses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {improvements.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-lumora-warning/15 bg-lumora-warning/5 p-3"
            >
              <div className="mt-1 size-1.5 shrink-0 rounded-full bg-lumora-warning" />
              <p className="text-sm leading-relaxed text-foreground">{item}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
