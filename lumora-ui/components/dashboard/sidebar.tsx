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
} from "lucide-react"
import { useState } from "react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: FileSearch, label: "Resume Analysis", active: false },
  { icon: Target, label: "Skill Gap", active: false },
  { icon: MessageSquare, label: "Interview Prep", active: false },
  { icon: Sparkles, label: "Resume Copilot", active: false },
  { icon: GitBranch, label: "Resume Versions", active: false },
  { icon: Settings, label: "Settings", active: false },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeItem, setActiveItem] = useState("Dashboard")

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
          src="/images/lumora-logo.jpeg"
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
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const isActive = activeItem === item.label
          return (
            <button
              key={item.label}
              onClick={() => setActiveItem(item.label)}
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
