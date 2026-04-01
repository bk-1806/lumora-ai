"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Plus } from "lucide-react"

const missingKeywords = [
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
  "Unit Testing",
]

export function SkillGapAnalysis() {
  return (
    <Card
      className="border-border bg-card"
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Target className="size-4 text-lumora-warning" />
          Skill Gap Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Missing keywords from the job description. Add these to improve your ATS score.
        </p>
        <div className="flex flex-wrap gap-2">
          {missingKeywords.map((keyword) => (
            <button
              key={keyword}
              className="group flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/5"
            >
              <span>{keyword}</span>
              <Plus className="size-3 text-muted-foreground transition-colors group-hover:text-primary" />
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 gap-2 border-primary/30 text-primary shadow-none hover:bg-primary/5"
        >
          <Plus className="size-3.5" />
          Add All to Resume
        </Button>
      </CardContent>
    </Card>
  )
}
