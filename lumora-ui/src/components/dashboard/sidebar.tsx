"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import {
  LayoutDashboard,
  FileSearch,
  Target,
  MessageSquare,
  Sparkles,
  GitBranch,
  Settings,
  ChevronLeft,
  ChevronRight,
  History,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ResumeHistory } from "./resume-history"
import { AnalysisResult } from "@/types"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard", tab: null },
  { icon: FileSearch, label: "Resume Analysis", id: "resume-analysis", tab: null },
  { icon: Target, label: "Skill Gap", id: "skill-gap", tab: null },
  { icon: MessageSquare, label: "Interview Prep", id: "interview-prep", tab: null },
  { icon: Sparkles, label: "Resume Copilot", id: "resume-copilot", tab: null },
  { icon: GitBranch, label: "Resume Versions", id: "resume-versions", tab: "resume-versions" },
  { icon: Settings, label: "Settings", id: "settings", tab: null },
]

interface SidebarProps {
  onHistorySelect?: (result: AnalysisResult) => void
}

export function Sidebar({ onHistorySelect }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeItem, setActiveItem] = useState("Dashboard")
  const [showHistory, setShowHistory] = useState(false)
  const router = useRouter()

  const handleItemClick = (item: typeof menuItems[number]) => {
    setActiveItem(item.label)
    if (item.tab) {
      // Navigate to tab URL
      router.push(`/dashboard?tab=${item.tab}`)
    } else {
      // Scroll to section on the same page
      router.push('/dashboard')
      setTimeout(() => {
        const el = document.getElementById(item.id)
        if (el) el.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }

  return (
    <aside
      className={cn(
        "relative hidden flex-col border-r border-purple-100 bg-white/70 backdrop-blur-xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 lg:flex",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-purple-100 px-6">
        <Image
          src="/lumora-logo.png"
          alt="Lumora AI"
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-lg object-contain shadow-sm border border-white"
        />
        {!collapsed && (
          <span className="text-xl font-bold tracking-tight text-slate-900 drop-shadow-sm">
            Lumora AI
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => {
          const isActive = activeItem === item.label
          return (
            <button
              key={item.label}
              onClick={() => handleItemClick(item)}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "text-purple-700 bg-purple-100 shadow-sm"
                  : "text-slate-500 hover:bg-purple-50 hover:text-purple-600"
              )}
              style={isActive ? { backgroundImage: "linear-gradient(to right, #f3e8ff, #faf5ff)" } : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <item.icon
                className={cn(
                  "size-[20px] shrink-0 transition-colors duration-200",
                  isActive ? "text-purple-600" : "text-slate-400 group-hover:text-purple-500"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}

        {/* Resume History toggle */}
        <div className="mt-4 border-t border-purple-100 pt-4">
          <button
            onClick={() => setShowHistory((s) => !s)}
            className={cn(
              "group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
              showHistory
                ? "text-purple-700 bg-purple-100 shadow-sm"
                : "text-slate-500 hover:bg-purple-50 hover:text-purple-600"
            )}
            style={showHistory ? { backgroundImage: "linear-gradient(to right, #f3e8ff, #faf5ff)" } : undefined}
          >
            {showHistory && (
              <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
            )}
            <History
              className={cn(
                "size-[20px] shrink-0 transition-colors duration-200",
                showHistory ? "text-purple-600" : "text-slate-400 group-hover:text-purple-500"
              )}
            />
            {!collapsed && <span>Resume History</span>}
          </button>

          {showHistory && !collapsed && (
            <div className="mt-2">
              <ResumeHistory onSelect={onHistorySelect || (() => { })} />
            </div>
          )}
        </div>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 z-10 flex size-6 items-center justify-center rounded-full border border-purple-200 bg-white text-slate-400 transition-colors hover:text-purple-600 hover:border-purple-300"
        style={{ boxShadow: "0 2px 8px rgba(168,85,247,0.15)" }}
      >
        {collapsed ? (
          <ChevronRight className="size-3" />
        ) : (
          <ChevronLeft className="size-3" />
        )}
      </button>
    </aside>
  )
}
