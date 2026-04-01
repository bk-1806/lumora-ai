"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { AnalysisResult } from "@/types"

/*
  { label: "Keyword Coverage", value: 82, trend: "up" as const, color: "#9B8CF5" },
  { label: "Semantic Similarity", value: 74, trend: "up" as const, color: "#A7C7FF" },
  { label: "Experience Relevance", value: 88, trend: "up" as const, color: "#34D399" },
  { label: "Skill Context Density", value: 65, trend: "down" as const, color: "#FBBF24" },
  { label: "Formatting Compliance", value: 91, trend: "neutral" as const, color: "#C7C3FF" },
*/

function TrendIcon({ trend }: { trend: "up" | "down" | "neutral" }) {
  if (trend === "up") return <TrendingUp className="size-4 text-green-500" />
  if (trend === "down") return <TrendingDown className="size-4 text-red-400" />
  return <Minus className="size-4 text-slate-400" />
}

function MetricBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
        style={{ width: `${value}%`, backgroundColor: color, opacity: 0.85 }}
      />
    </div>
  )
}

export function AnalysisMetrics({ result }: { result: AnalysisResult }) {
  const metrics = [
    { label: "Keyword Coverage", value: Math.round(result.keyword_score), trend: "up" as const, color: "#9B8CF5" },
    { label: "Semantic Similarity", value: Math.round(result.similarity_score), trend: "up" as const, color: "#A7C7FF" },
    { label: "Experience Relevance", value: Math.round(result.experience_score), trend: "up" as const, color: "#34D399" },
    { label: "Skill Context Density", value: Math.round(result.skill_density), trend: "down" as const, color: "#FBBF24" },
    { label: "Formatting Compliance", value: Math.round(result.formatting_score), trend: "neutral" as const, color: "#C7C3FF" },
    { label: "Quantification Score", value: Math.round(result.quantification_score), trend: "down" as const, color: "#F87171" },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <Card
          key={metric.label}
          className="group border-white bg-white/70 backdrop-blur-xl transition-all duration-300 hover:border-purple-200 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(168,85,247,0.08)] rounded-3xl"
        >
          <CardContent className="pt-6 pb-6 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <p className="text-sm font-semibold text-slate-600">
                  {metric.label}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {metric.value}%
                  </span>
                  <TrendIcon trend={metric.trend} />
                </div>
                <MetricBar value={metric.value} color={metric.color} />
              </div>
              <div
                className="mt-1 size-2 shrink-0 rounded-full"
                style={{ backgroundColor: metric.color }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
