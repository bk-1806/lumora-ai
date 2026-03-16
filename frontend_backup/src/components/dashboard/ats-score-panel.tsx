"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Zap, Shield } from "lucide-react"
import { AnalysisResult } from "@/types"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Save, Loader2, Check } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"

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

export function AtsScorePanel({ result }: { result: AnalysisResult }) {
  const { user, setShowAuthModal } = useAuth()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    try {
      setIsSaving(true)
      console.log("Triggering save analysis to database...");
      const filename = localStorage.getItem("analysis_filename") || "resume.pdf"
      const jd = localStorage.getItem("analysis_jd") || "Target Job Description"
      
      const payload = {
        user_id: user.id,
        resume_text: result.optimized_resume_text || "",
        filename: filename,
        job_description: jd,
        analysis_data: result
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/api/auth/save-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save analysis data")
      }

      toast({
        title: "Analysis Saved!",
        description: "Your resume analysis has been safely stored in your dashboard.",
      })
      setIsSaved(true)

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to save the analysis.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card
      className="h-full border-border bg-card relative"
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
    >
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Shield className="size-4 text-primary" />
          Career Intelligence Score
        </CardTitle>
        <Button 
          variant={isSaved ? "outline" : "default"} 
          size="sm" 
          onClick={handleSave} 
          disabled={isSaving || isSaved}
          className={!isSaved ? "bg-primary text-primary-foreground" : "text-green-600 border-green-600"}
        >
          {isSaving ? <Loader2 className="size-4 animate-spin mr-2" /> : 
           isSaved ? <Check className="size-4 mr-2" /> : <Save className="size-4 mr-2" />}
          {isSaved ? "Saved" : "Save Analysis"}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-5">
        <AnimatedGauge score={Math.round(result.final_ats_score)} />

        <div className="grid w-full grid-cols-2 gap-3">
          <div
            className="flex flex-col items-center gap-1 rounded-xl border border-border bg-background p-3"
          >
            <div className="flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-lumora-success" />
              {/* No pass_probability as per user request */}
            </div>
            
          </div>
          <div
            className="flex flex-col items-center gap-1 rounded-xl border border-border bg-background p-3"
          >
            <div className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-lumora-warning" />
              {/* Improvement logic removed for simplicity, or we can use generic */}
            </div>
            
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
