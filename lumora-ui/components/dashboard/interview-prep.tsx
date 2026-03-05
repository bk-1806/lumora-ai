"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, ChevronDown, ChevronUp, Copy, Check } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const questions = [
  {
    question: "Tell me about a time you led a cross-functional team to deliver a complex project.",
    answer:
      "Focus on specific metrics: team size, timeline, and measurable outcomes. Mention your leadership style and how you navigated challenges. Example: 'I led a team of 8 engineers and 3 designers to deliver a microservices migration in 4 months, reducing API latency by 60%.'",
  },
  {
    question: "How do you approach designing scalable distributed systems?",
    answer:
      "Discuss your systematic approach: requirements gathering, trade-off analysis, and iterative design. Mention specific patterns like CQRS, event sourcing, or saga pattern. Reference real projects where you applied these principles.",
  },
  {
    question: "Describe your experience with CI/CD pipelines and DevOps practices.",
    answer:
      "Highlight specific tools (Jenkins, GitHub Actions, ArgoCD) and practices (blue-green deployments, canary releases). Quantify improvements: 'Reduced deployment time from 2 hours to 15 minutes with automated pipelines.'",
  },
  {
    question: "How do you handle disagreements with stakeholders about technical decisions?",
    answer:
      "Emphasize data-driven decision making and communication. Discuss how you present trade-offs clearly and align technical choices with business objectives. Share a specific example of a productive disagreement.",
  },
  {
    question: "What is your approach to optimizing application performance?",
    answer:
      "Walk through your methodology: profiling, identifying bottlenecks, implementing optimizations, and measuring results. Mention specific tools (Chrome DevTools, Lighthouse, APM tools) and techniques (lazy loading, caching, code splitting).",
  },
]

export function InterviewPrep() {
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
        {questions.map((q, i) => (
          <div
            key={i}
            className={cn(
              "rounded-lg border border-border transition-all duration-200",
              expandedIdx === i && "border-primary/25 bg-primary/[0.03]"
            )}
          >
            {/* Use a div with role and keyboard handler instead of nested buttons */}
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
                {q.question}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopy(q.question + "\n\n" + q.answer, i)
                  }}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Copy question and answer"
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
            {expandedIdx === i && (
              <div className="border-t border-border/50 px-4 pb-4 pt-3">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {q.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
