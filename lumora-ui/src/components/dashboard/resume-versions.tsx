"use client"

import { useEffect, useState } from "react"
import { History, Clock, ChevronRight, Trash2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { AnalysisResult } from "@/types"

interface SavedAnalysis {
  id: string
  user_id: string
  resume_name: string
  ats_score: number
  analysis_data: AnalysisResult
  created_at: string
}

interface ResumeVersionsProps {
  onOpenAnalysis?: (result: AnalysisResult) => void
}

export function ResumeVersions({ onOpenAnalysis }: ResumeVersionsProps) {
  const { user } = useAuth()
  const [versions, setVersions] = useState<SavedAnalysis[]>([])
  const [loading, setLoading] = useState(true)

  // user_id = user.email from Supabase Auth
  const userId = user?.email ?? null

  useEffect(() => {
    const fetchVersions = async () => {
      setLoading(true)

      if (!userId) {
        setVersions([])
        setLoading(false)
        return
      }

      const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

      try {
        const res = await fetch(
          `${API_BASE}/api/auth/resume-history?user_id=${encodeURIComponent(userId)}`
        )

        if (!res.ok) {
          console.error("resume-history error:", await res.text())
          setVersions([])
          return
        }

        const data = await res.json()
        setVersions(data.data || [])
      } catch (err) {
        console.error("resume-history fetch error:", err)
        setVersions([])
      } finally {
        setLoading(false)
      }
    }

    fetchVersions()
  }, [userId])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="rounded-3xl border border-white bg-white/60 backdrop-blur-xl p-10 text-center shadow-[0_8px_30px_rgb(168,85,247,0.06)]">
        <History className="mx-auto mb-4 size-12 text-slate-400 opacity-50" />
        <h3 className="text-base font-bold text-slate-800 mb-2">Sign in to view history</h3>
        <p className="text-sm text-slate-500">Log in to save and access your analysis history.</p>
      </div>
    )
  }

  if (!versions.length) {
    return (
      <div className="rounded-3xl border border-white bg-white/60 backdrop-blur-xl p-10 text-center shadow-[0_8px_30px_rgb(168,85,247,0.06)]">
        <History className="mx-auto mb-4 size-12 text-slate-400 opacity-50" />
        <h3 className="text-base font-bold text-slate-800 mb-2">No saved analyses yet</h3>
        <p className="text-sm text-slate-500">After running an ATS scan, use the save modal to save it here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 ml-1">
        My Resumes
      </h2>
      {versions.map((v) => {
        const date = new Date(v.created_at)
        const score = Math.round(v.ats_score)
        const scoreColor =
          score >= 75 ? "text-green-700 bg-green-100 border-green-200"
            : score >= 55 ? "text-amber-700 bg-amber-100 border-amber-200"
              : "text-red-700 bg-red-100 border-red-200"

        return (
          <div
            key={v.id}
            className="rounded-2xl border border-white bg-white/60 backdrop-blur-xl p-5 hover:border-purple-200 transition-all hover:shadow-[0_8px_30px_rgb(168,85,247,0.08)] shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="text-base font-bold text-slate-800 truncate">{v.resume_name}</p>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 font-medium">
                  <Clock className="size-3.5" />
                  <span>{date.toLocaleDateString()}</span>
                </div>
              </div>
              <span className={`shrink-0 px-3 py-1.5 rounded-xl border text-sm font-extrabold ${scoreColor}`}>
                {score}%
              </span>
            </div>

            {onOpenAnalysis && v.analysis_data && (
              <button
                onClick={() => onOpenAnalysis(v.analysis_data)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-purple-700 bg-purple-50/80 hover:bg-purple-100 border border-purple-100 hover:border-purple-200 transition-all shadow-sm"
              >
                Open Analysis
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
