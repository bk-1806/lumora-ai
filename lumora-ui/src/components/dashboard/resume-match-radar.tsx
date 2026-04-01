"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Radar as RadarIcon } from "lucide-react"
import { AnalysisResult } from "@/types"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"

/*
  { subject: "Keywords", value: 82, fullMark: 100 },
  { subject: "Semantic Similarity", value: 74, fullMark: 100 },
  { subject: "Experience Relevance", value: 88, fullMark: 100 },
  { subject: "Skill Density", value: 65, fullMark: 100 },
  { subject: "Formatting", value: 91, fullMark: 100 },
*/

export function ResumeMatchRadar({ result }: { result: AnalysisResult }) {
  const data = [
    { subject: "Keywords", value: result.keyword_score, fullMark: 100 },
    { subject: "Semantic Similarity", value: result.similarity_score, fullMark: 100 },
    { subject: "Experience Relevance", value: result.experience_score, fullMark: 100 },
    { subject: "Skill Density", value: result.skill_density, fullMark: 100 },
    { subject: "Formatting", value: result.formatting_score, fullMark: 100 },
  ]

  return (
    <Card
      className="h-full border-white bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(168,85,247,0.06)] rounded-3xl"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <RadarIcon className="size-4 text-purple-600" />
          Resume Match Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#E6E9F5" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#64748B", fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Match"
              dataKey="value"
              stroke="#a855f7"
              fill="url(#radarGradient)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
