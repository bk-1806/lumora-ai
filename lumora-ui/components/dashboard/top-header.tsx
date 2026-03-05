"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import { Upload, ClipboardPaste, Bell, Search, Menu } from "lucide-react"

export function TopHeader() {
  return (
    <header
      className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6"
    >
      {/* Left - Logo (mobile) + Page Title */}
      <div className="flex items-center gap-3">
        <Image
          src="/images/lumora-logo.jpeg"
          alt="Lumora AI"
          width={28}
          height={28}
          className="size-7 shrink-0 rounded-lg object-contain mix-blend-multiply lg:hidden"
        />
        <div>
          <h1 className="text-base font-semibold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground">Career Intelligence Overview</p>
        </div>
      </div>

      {/* Center - Search (hidden on mobile) */}
      <div className="hidden max-w-md flex-1 px-8 md:block">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="size-3.5 text-muted-foreground" />
          <input
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          className="gap-2 text-primary-foreground"
          style={{
            background: "linear-gradient(135deg, #9B8CF5, #A7C7FF)",
            boxShadow: "0 2px 8px rgba(155,140,245,0.25)",
          }}
        >
          <Upload className="size-3.5" />
          <span className="hidden sm:inline">Upload Resume</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border shadow-none"
        >
          <ClipboardPaste className="size-3.5" />
          <span className="hidden sm:inline">Paste JD</span>
        </Button>

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

        {/* Notification */}
        <button className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
        </button>

        {/* User Avatar */}
        <Avatar className="size-8 border border-border">
          <AvatarFallback className="text-xs font-semibold text-primary" style={{ backgroundColor: "#EEF2FF" }}>
            JD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
