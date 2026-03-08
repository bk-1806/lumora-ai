"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Send, User, Bot } from "lucide-react"
import { AnalysisResult } from "@/types"
import { useState } from "react"
import { cn } from "@/lib/utils"

const suggestedPrompts = [
  "How can I improve my ATS score?",
  "What skills should I add?",
  "Rewrite this bullet point",
  "Optimize my summary",
]

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "Hello! I'm your Resume Copilot. I can help you optimize your resume, improve your ATS score, rewrite bullet points, and suggest improvements. What would you like to work on?",
    timestamp: "10:30 AM",
  },
  {
    role: "user",
    content: "How can I improve my ATS score?",
    timestamp: "10:31 AM",
  },
  {
    role: "assistant",
    content:
      "Based on my analysis, here are 3 key improvements to boost your ATS score from 78% to 90%+:\n\n1. Add missing keywords: Docker, Kubernetes, and CI/CD are mentioned in the job description but missing from your resume.\n\n2. Quantify more achievements: Your project management experience could benefit from specific metrics like team size, budget, and timeline improvements.\n\n3. Match job title format: Use 'Senior Software Engineer' instead of 'Sr. SWE' to ensure ATS systems can parse your title correctly.",
    timestamp: "10:31 AM",
  },
]

export function ResumeCopilot({ result }: { result: AnalysisResult }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return
    const now = new Date()
    const timestamp = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })

    setMessages((prev) => [
      ...prev,
      { role: "user", content: input, timestamp },
    ])
    setInput("")
    setIsTyping(true)

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${API_BASE}/api/copilot-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_message: input,
        conversation_history: messages.map(m => ({ role: m.role, content: m.content })),
        resume_text: result.optimized_resume_text || "",
        jd_text: "",
        keyword_score: result.keyword_score,
        similarity_score: result.similarity_score,
        experience_score: result.experience_score,
        skill_density: result.skill_density,
        final_ats_score: result.final_ats_score,
        pass_probability: 0,
        skill_gap: result.missing_keywords || [],
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        missing_keywords: result.missing_keywords || []
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.response || "Sorry, I encountered an error.",
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        }]);
      })
      .catch(err => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Error connecting to Resume Copilot.",
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        }]);
      });
  }

  return (
    <Card
      className="flex flex-col border-border bg-card"
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="size-4 text-primary" />
          Resume Copilot
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {/* Messages */}
        <div className="flex max-h-[400px] flex-col gap-3 overflow-y-auto pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2.5",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  msg.role === "user"
                    ? "bg-primary"
                    : "border border-border bg-background"
                )}
              >
                {msg.role === "user" ? (
                  <User className="size-3.5 text-primary-foreground" />
                ) : (
                  <Bot className="size-3.5 text-primary" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-3.5 py-2.5",
                  msg.role === "user"
                    ? "bg-primary/10 text-foreground"
                    : "border border-border bg-background text-foreground"
                )}
              >
                <p className="whitespace-pre-line text-sm leading-relaxed">
                  {msg.content}
                </p>
                <span className="mt-1 block text-[10px] text-muted-foreground">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                <Bot className="size-3.5 text-primary" />
              </div>
              <div className="flex items-center gap-1 rounded-xl border border-border bg-background px-3.5 py-2.5">
                <div className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                <div className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                <div className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your resume..."
            className="flex-1 bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="flex size-8 items-center justify-center rounded-lg text-primary-foreground transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #9B8CF5, #A7C7FF)" }}
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
