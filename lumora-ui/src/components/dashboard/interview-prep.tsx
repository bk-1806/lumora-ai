"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, ChevronDown, ChevronUp, Copy, Check } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { AnalysisResult } from "@/types"

function highlightText(text: string, query: string) {
  if (!query) return <span>{text}</span>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </span>
  )
}

export function InterviewPrep({ result, searchQuery = "" }: { result: AnalysisResult; searchQuery?: string }) {
  const questions = result.interview_questions || []
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  return (
    <Card
      className="border-white bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(168,85,247,0.06)] rounded-3xl"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <MessageSquare className="size-4 text-purple-500" />
          Interview Preparation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No questions generated.</p>
        ) : (
          questions.map((q, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-2xl border bg-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300",
                  expandedIdx === i ? "border-purple-200 bg-purple-50/80 shadow-[0_8px_24px_rgba(168,85,247,0.08)]" : "border-white hover:border-purple-100"
                )}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setExpandedIdx(expandedIdx === i ? null : i)
                    }
                  }}
                  className="flex w-full cursor-pointer items-center justify-between p-4 px-5 text-left"
                >
                  <span className={cn("pr-4 text-sm font-semibold transition-colors", expandedIdx === i ? "text-purple-800" : "text-slate-700")}>
                    {highlightText(q, searchQuery)}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopy(q, i)
                      }}
                      className="flex size-8 items-center justify-center rounded-xl bg-white/50 text-slate-400 border border-white transition-all hover:bg-white hover:text-purple-600 hover:shadow-sm"
                      aria-label="Copy question"
                    >
                      {copiedIdx === i ? (
                        <Check className="size-4 text-green-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                    {expandedIdx === i ? (
                      <ChevronUp className="size-5 text-purple-400" />
                    ) : (
                      <ChevronDown className="size-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
