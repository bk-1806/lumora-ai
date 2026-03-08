"use client"

import { useEffect, useState } from "react"
import { AnalysisResult } from "@/types"
import { cn } from "@/lib/utils"
import { FileText, Clock, ChevronRight } from "lucide-react"

interface HistoryItem {
    id: string
    ats_score: number
    resume_name: string | null
    created_at: string
    result: AnalysisResult
}

interface ResumeHistoryProps {
    onSelect: (result: AnalysisResult) => void
}

export function ResumeHistory({ onSelect }: ResumeHistoryProps) {
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    useEffect(() => {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        fetch(`${API_BASE}/api/resume-history`)
            .then((r) => r.json())
            .then((res) => {
                if (res.data) setHistory(res.data)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center py-4">
                <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
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

                return (
                    <button
                        key={item.id}
                        onClick={() => {
                            setSelectedId(item.id)
                            onSelect(item.result)
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
