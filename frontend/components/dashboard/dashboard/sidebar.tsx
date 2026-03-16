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
import { ResumeHistory } from "./resume-history"
import { AnalysisResult } from "@/types"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard", active: true },
  { icon: FileSearch, label: "Resume Analysis", id: "resume-analysis", active: false },
  { icon: Target, label: "Skill Gap", id: "skill-gap", active: false },
  { icon: MessageSquare, label: "Interview Prep", id: "interview-prep", active: false },
  { icon: Sparkles, label: "Resume Copilot", id: "resume-copilot", active: false },
  { icon: GitBranch, label: "Resume Versions", id: "resume-versions", active: false },
  { icon: Settings, label: "Settings", id: "settings", active: false },
]

interface SidebarProps {
  onHistorySelect?: (result: AnalysisResult) => void
}

export function Sidebar({ onHistorySelect }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeItem, setActiveItem] = useState("Dashboard")
  const [showHistory, setShowHistory] = useState(false)

  return (
    <aside
      className={cn(
        "relative hidden flex-col border-r border-border bg-card transition-all duration-300 lg:flex",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <Image
          src="/lumora-logo.png"
          alt="Lumora AI"
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-lg object-contain mix-blend-multiply"
        />
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight text-foreground">
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
              onClick={() => {
                setActiveItem(item.label)
                if (item.id) {
                  const el = document.getElementById(item.id)
                  if (el) el.scrollIntoView({ behavior: "smooth" })
                }
              }}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              style={isActive ? { backgroundColor: "#EEF2FF" } : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <item.icon
                className={cn(
                  "size-[18px] shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}

        {/* Resume History toggle */}
        <div className="mt-4 border-t border-border pt-4">
          <button
            onClick={() => setShowHistory((s) => !s)}
            className={cn(
              "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              showHistory
                ? "text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            style={showHistory ? { backgroundColor: "#EEF2FF" } : undefined}
          >
            {showHistory && (
              <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
            )}
            <History
              className={cn(
                "size-[18px] shrink-0 transition-colors",
                showHistory ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
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
        className="absolute -right-3 top-20 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
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
