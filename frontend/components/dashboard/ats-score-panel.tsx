"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Zap, Shield } from "lucide-react"
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
            <stop offset="0%" stopColor="#9B8CF5" />
            <stop offset="100%" stopColor="#A7C7FF" />
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

export function AtsScorePanel() {
  return (
    <Card
      className="h-full border-border bg-card"
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Shield className="size-4 text-primary" />
          Career Intelligence Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-5">
        <AnimatedGauge score={78} />

        <div className="grid w-full grid-cols-2 gap-3">
          <div
            className="flex flex-col items-center gap-1 rounded-xl border border-border bg-background p-3"
          >
            <div className="flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-lumora-success" />
              <span className="text-sm font-semibold text-foreground">82%</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Pass Probability</span>
          </div>
          <div
            className="flex flex-col items-center gap-1 rounded-xl border border-border bg-background p-3"
          >
            <div className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-lumora-warning" />
              <span className="text-sm font-semibold text-foreground">+15%</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Improvement Potential</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
