"use client"

import { useState } from "react"
import { X, Save, Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { AnalysisResult } from "@/types"

interface SaveAnalysisModalProps {
  result: AnalysisResult
  onClose: () => void
  onSaved: () => void
}

export function SaveAnalysisModal({ result, onClose, onSaved }: SaveAnalysisModalProps) {
  const { user } = useAuth()
  const [resumeName, setResumeName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // user_id = user.email from Supabase Auth
  const userId = user?.email ?? "anonymous"

  const handleSave = async () => {
    if (!resumeName.trim()) {
      setError("Please enter a resume name.")
      return
    }

    setError(null)
    setLoading(true)

    const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

    try {
      const res = await fetch(`${API_BASE}/api/auth/save-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          filename: resumeName.trim() || 'resume.pdf',
          label: resumeName.trim(),
          resume_text: result._resume_text || result.resume_text || '',
          job_description: result.job_description || '',
          analysis_data: result,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error("save-analysis error:", text)
        setError("Failed to save. Please try again.")
        return
      }

      onSaved()
    } catch (err) {
      console.error("save-analysis fetch error:", err)
      setError("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
          <div>
            <h2 className="text-base font-semibold text-foreground">Save Resume Analysis</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              ATS Score: <span className="font-bold text-primary">{Math.round(result.final_ats_score)}%</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Resume Name</label>
            <input
              autoFocus
              type="text"
              value={resumeName}
              onChange={e => setResumeName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="e.g. Software Engineer @ Google"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {user && (
            <p className="text-xs text-muted-foreground">
              Saving to your account: <span className="text-foreground font-medium">{userId}</span>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border bg-secondary/10">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !resumeName.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #9B8CF5, #7c8cff)", boxShadow: "0 2px 8px rgba(124,140,255,0.3)" }}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {loading ? "Saving..." : "Save to History"}
          </button>
        </div>
      </div>
    </div>
  )
}
