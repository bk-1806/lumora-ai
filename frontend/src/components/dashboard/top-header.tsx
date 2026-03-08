"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import { Upload, Bell, Search } from "lucide-react"
import { useSearch } from "@/context/search-context"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

export function TopHeader() {
  const { searchQuery, setSearchQuery } = useSearch()
  const [stats, setStats] = useState({ uploads: 0, avg: 0 })
  const [hasNewNotification, setHasNewNotification] = useState(true)

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${API_BASE}/api/resume-history`)
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          setStats({
            uploads: data.data.length,
            avg: Math.round(data.data.reduce((acc: any, curr: any) => acc + curr.ats_score, 0) / data.data.length)
          });
        }
      }).catch(() => { })
  }, [])

  return (
    <header
      className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6"
    >
      {/* Left - Logo (mobile) + Page Title */}
      <div className="flex items-center gap-3">
        <Image
          src="/lumora-logo.png"
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

      {/* Center - Search */}
      <div className="hidden max-w-md flex-1 px-8 md:block">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
          <Search className="size-3.5 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills, keywords, questions..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        <Link href="/upload">
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
        </Link>

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

        {/* Notification */}
        <button
          onClick={() => setHasNewNotification(false)}
          className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Bell className="size-4" />
          {hasNewNotification && (
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
          )}
        </button>

        {/* User Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="size-8 border border-border cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
              <AvatarFallback className="text-xs font-semibold text-primary" style={{ backgroundColor: "#EEF2FF" }}>
                LA
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">User</p>
                <p className="text-xs leading-none text-muted-foreground">user@example.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span className="flex items-center justify-between w-full">
                <span>Uploads</span>
                <span className="font-semibold text-primary">{stats.uploads}</span>
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="flex items-center justify-between w-full">
                <span>Avg ATS Score</span>
                <span className="font-semibold text-primary">{stats.avg}%</span>
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Resume History</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
