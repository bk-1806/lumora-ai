"use client"

import { useEffect, useState, MouseEvent } from "react"
import { AnalysisResult } from "@/types"
import { cn } from "@/lib/utils"
import { FileText, Clock, ChevronRight, Trash2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"

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
    const { user, setShowAuthModal } = useAuth()
    const { toast } = useToast()
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    useEffect(() => {
        if (!user) {
            setLoading(false)
            return
        }

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        fetch(`${API_BASE}/api/auth/resume-history?user_id=${user.id}`)
            .then((r) => r.json())
            .then((res) => {
                if (res.data) setHistory(res.data)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [user])

    const handleDelete = async (e: MouseEvent, id: string) => {
        e.stopPropagation()
        if (!confirm("Are you sure you want to delete this analysis?")) return

        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_BASE}/api/auth/resume-analysis/${id}`, {
                method: "DELETE"
            })
            if (!response.ok) throw new Error("Failed to delete")

            setHistory(prev => prev.filter(item => item.id !== id))
            if (selectedId === id) setSelectedId(null)
            toast({ title: "Deleted", description: "Analysis removed from history." })
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.message })
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-4">
                <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-2">Log in to view history</p>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                    Log In
                </button>
            </div>
        )
    }

    if (!history.length) {
        return (
            <p className="px-3 py-2 text-xs text-muted-foreground text-center">No history yet.</p>
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
                            <div className="flex flex-row gap-1 items-center">
                                <button 
                                  onClick={(e) => handleDelete(e, item.id)}
                                  className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                >
                                    <Trash2 className="size-3 shrink-0" />
                                </button>
                                <ChevronRight className={cn("size-3 shrink-0 transition-transform", isActive && "rotate-90")} />
                            </div>
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
