"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import { Upload, Bell, Search, LogIn } from "lucide-react"
import { useSearch } from "@/context/search-context"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

export function TopHeader() {
  const { searchQuery, setSearchQuery } = useSearch()
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [hasNewNotification, setHasNewNotification] = useState(true)

  // user_id = user.id (from Supabase Auth, must be UUID)
  const userId = user?.id ?? null
  const initials = userId ? userId.charAt(0).toUpperCase() : 'LA'

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header
      className="flex h-20 shrink-0 items-center justify-between border-b border-purple-100 bg-white/70 backdrop-blur-xl px-8 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
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
          <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Career Intelligence Overview</p>
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
            className="gap-2 text-white border-0 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-[0_4px_14px_rgba(168,85,247,0.3)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.4)] transition-all font-semibold rounded-xl px-5"
          >
            <Upload className="size-4" />
            <span className="hidden sm:inline">Upload Resume</span>
          </Button>
        </Link>

        <div className="mx-2 hidden h-6 w-px bg-purple-100 sm:block" />

        {/* Notification */}
        <button
          onClick={() => setHasNewNotification(false)}
          className="relative flex size-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-purple-50 hover:text-purple-600 border border-transparent hover:border-purple-100"
        >
          <Bell className="size-5" />
          {hasNewNotification && (
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
          )}
        </button>

        {/* User Avatar or Login */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="size-10 border-2 border-purple-200 cursor-pointer hover:ring-4 hover:ring-purple-100 transition-all shadow-sm">
                <AvatarFallback className="text-sm font-bold text-purple-700 bg-purple-50">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-sm font-medium leading-none truncate">{userId}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard?tab=resume-versions')}>
                Resume History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm" className="gap-2">
              <LogIn className="size-3.5" />
              <span className="hidden sm:inline">Log In</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
