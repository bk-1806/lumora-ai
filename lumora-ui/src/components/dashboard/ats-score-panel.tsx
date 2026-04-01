"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Zap, Shield } from "lucide-react"
import { AnalysisResult } from "@/types"
import { useEffect, useState } from "react"

function AnimatedGauge({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = 76
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="relative flex items-center justify-center">
      <svg width="192" height="192" viewBox="0 0 192 192" className="-rotate-90">
        <circle
          cx="96"
          cy="96"
          r={radius}
          fill="none"
          stroke="#E6E9F5"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle
          cx="96"
          cy="96"
          r={radius}
          fill="none"
          stroke="url(#gaugeGradientLight)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-[1500ms] ease-out"
        />
        <defs>
          <linearGradient id="gaugeGradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-foreground">{animatedScore}</span>
        <span className="text-xs text-muted-foreground">ATS Score</span>
      </div>
    </div>
  )
}

export function AtsScorePanel({ result }: { result: AnalysisResult }) {
  return (
    <Card
      className="h-full border-white bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(168,85,247,0.08)] rounded-3xl"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Shield className="size-4 text-purple-600" />
          Career Intelligence Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-5">
        <AnimatedGauge score={Math.round(result.final_ats_score)} />

        <div className="grid w-full grid-cols-2 gap-3">
          <div
            className="flex flex-col items-center gap-1 rounded-2xl border border-white/60 bg-white/50 shadow-sm p-4"
          >
            <div className="flex items-center gap-1.5">
              <TrendingUp className="size-4 text-green-500" />
              <span className="text-xs font-semibold text-slate-700">Top 10% Match</span>
            </div>
            
          </div>
          <div
            className="flex flex-col items-center gap-1 rounded-2xl border border-white/60 bg-white/50 shadow-sm p-4"
          >
            <div className="flex items-center gap-1.5">
              <Zap className="size-4 text-amber-500" />
              <span className="text-xs font-semibold text-slate-700">High Impact</span>
            </div>
            
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
