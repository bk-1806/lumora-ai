"use client"

import { useEffect, useState } from "react"
import { AnalysisResult } from "@/types"
import { cn } from "@/lib/utils"
import { FileText, Clock, ChevronRight } from "lucide-react"
import { useAuth } from "@/context/auth-context"

interface HistoryItem {
    id: string
    ats_score: number
    resume_name: string | null
    created_at: string
    result: AnalysisResult
    analysis_data: AnalysisResult
}

interface ResumeHistoryProps {
    onSelect: (result: AnalysisResult) => void
}

export function ResumeHistory({ onSelect }: ResumeHistoryProps) {
    const { user } = useAuth()
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const userId = user?.id ?? null

    useEffect(() => {
        if (!userId) {
            setHistory([])
            setLoading(false)
            return
        }

        const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')
        console.log('[resume-history] Fetching history for user_id:', userId)

        fetch(`${API_BASE}/api/auth/resume-history?user_id=${encodeURIComponent(userId)}`)
            .then((r) => r.json())
            .then((res) => {
                console.log('[resume-history] Response:', res)
                if (res.data) setHistory(res.data)
            })
            .catch((err) => console.error('[resume-history] Fetch error:', err))
            .finally(() => setLoading(false))
    }, [userId])

    if (loading) {
        return (
            <div className="flex justify-center py-4">
                <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!userId) {
        return (
            <p className="px-3 py-2 text-xs text-muted-foreground">Sign in to see your history.</p>
        )
    }

    if (!history.length) {
        return (
            <p className="px-3 py-2 text-xs text-muted-foreground">No history yet.</p>
        )
    }

    return (
        <div className="space-y-1">
            {history.map((item) => {
                const date = new Date(item.created_at)
                const label = item.resume_name || `Resume Scan`
                const score = Math.round(item.ats_score)
                const isActive = selectedId === item.id
                // analysis_data is the field returned by the new backend
                const resultData = item.analysis_data || item.result

                return (
                    <button
                        key={item.id}
                        onClick={() => {
                            setSelectedId(item.id)
                            if (resultData) onSelect(resultData)
                        }}
                        className={cn(
                            "group w-full rounded-lg px-3 py-2 text-left transition-all duration-200",
                            isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                                <FileText className="size-3.5 shrink-0" />
                                <span className="truncate text-xs font-medium">{label}</span>
                            </div>
                            <ChevronRight className={cn("size-3 shrink-0 transition-transform", isActive && "rotate-90")} />
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[10px] opacity-70">
                            <span className="font-semibold text-primary">{score}%</span>
                            <span>ATS</span>
                            <Clock className="size-2.5" />
                            <span>{date.toLocaleDateString()}</span>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}
