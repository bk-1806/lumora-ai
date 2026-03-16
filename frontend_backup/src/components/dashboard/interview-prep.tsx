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
      className="border-border bg-card"
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <MessageSquare className="size-4 text-lumora-secondary" />
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
                "rounded-lg border border-border transition-all duration-200",
                expandedIdx === i && "border-primary/25 bg-primary/[0.03]"
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
                className="flex w-full cursor-pointer items-center justify-between p-4 text-left"
              >
                <span className="pr-4 text-sm font-medium text-foreground">
                  {highlightText(q, searchQuery)}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopy(q, i)
                    }}
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Copy question"
                  >
                    {copiedIdx === i ? (
                      <Check className="size-3.5 text-lumora-success" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                  {expandedIdx === i ? (
                    <ChevronUp className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
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
