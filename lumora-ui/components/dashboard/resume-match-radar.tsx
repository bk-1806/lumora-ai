"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Radar as RadarIcon } from "lucide-react"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"

const data = [
  { subject: "Keywords", value: 82, fullMark: 100 },
  { subject: "Semantic Similarity", value: 74, fullMark: 100 },
  { subject: "Experience Relevance", value: 88, fullMark: 100 },
  { subject: "Skill Density", value: 65, fullMark: 100 },
  { subject: "Formatting", value: 91, fullMark: 100 },
  { subject: "ATS Pass Probability", value: 78, fullMark: 100 },
]

export function ResumeMatchRadar() {
  return (
    <Card
      className="h-full border-border bg-card"
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <RadarIcon className="size-4 text-primary" />
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
              stroke="#9B8CF5"
              fill="url(#radarGradient)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#9B8CF5" />
                <stop offset="100%" stopColor="#A7C7FF" />
              </linearGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
