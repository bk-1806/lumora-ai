"use client"

import { useEffect, useState } from "react"
import { History, Clock, ChevronRight } from "lucide-react"

interface VersionItem {
    id: string
    user_id: string
    timestamp: string
    resume_text: string
    ats_score: number
    metrics: any
}

export function ResumeVersions() {
    const [versions, setVersions] = useState<VersionItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchVersions = async () => {
            try {
                const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${API_BASE}/api/resume-versions`)
                const data = await res.json()
                if (data.data) {
                    setVersions(data.data)
                }
            } catch (err) {
                console.error("Failed to fetch versions:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchVersions()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center py-4">
                <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!versions.length) {
        return (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
                <History className="mx-auto mb-3 size-8 text-muted-foreground opacity-50" />
                <h3 className="text-sm font-medium text-foreground">No versions yet</h3>
                <p className="mt-1 text-xs text-muted-foreground">Analyses you save will appear here.</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border bg-secondary/30 px-4 py-3">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <History className="size-4 text-primary" />
                    Resume Versions
                </h3>
            </div>
            <div className="divide-y divide-border">
                {versions.map((v) => {
                    const date = new Date(v.timestamp)
                    return (
                        <div key={v.id} className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/20">
                            <div>
                                <p className="text-sm font-medium text-foreground">Version {date.toLocaleDateString()}</p>
                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="size-3" />
                                    <span>{date.toLocaleTimeString()}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground mb-0.5">ATS Score</p>
                                    <p className="text-sm font-bold text-primary">{Math.round(v.ats_score)}%</p>
                                </div>
                                <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
