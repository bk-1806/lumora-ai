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
      className="flex flex-col border-white bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(168,85,247,0.06)] rounded-3xl h-full"
    >
      <CardHeader className="pb-3 border-b border-purple-50/50 mb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Sparkles className="size-4 text-purple-600" />
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
                "flex gap-3",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full shadow-sm",
                  msg.role === "user"
                    ? "bg-purple-600"
                    : "border border-purple-100 bg-white"
                )}
              >
                {msg.role === "user" ? (
                  <User className="size-4 text-white" />
                ) : (
                  <Bot className="size-4 text-purple-600" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[80%] px-4 py-3 shadow-sm",
                  msg.role === "user"
                    ? "bg-purple-100 text-purple-900 rounded-2xl rounded-tr-sm"
                    : "border border-white bg-white/80 text-slate-700 rounded-2xl rounded-tl-sm backdrop-blur-sm"
                )}
              >
                <p className="whitespace-pre-line text-[13px] leading-relaxed font-medium">
                  {msg.content}
                </p>
                <span className="mt-1.5 block text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-purple-100 bg-white shadow-sm">
                <Bot className="size-4 text-purple-600" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                <div className="size-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:0ms]" />
                <div className="size-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:150ms]" />
                <div className="size-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="flex flex-wrap gap-2 mt-2">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="rounded-full border border-purple-200 bg-white/50 px-4 py-1.5 text-xs font-semibold text-purple-700 shadow-sm transition-all hover:bg-purple-50 hover:border-purple-300"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 rounded-2xl border border-white bg-white/60 p-2 shadow-inner focus-within:ring-2 focus-within:ring-purple-200 transition-all">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your resume..."
            className="flex-1 bg-transparent px-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="flex size-10 items-center justify-center rounded-xl text-white transition-all shadow-md bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            <Send className="size-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
