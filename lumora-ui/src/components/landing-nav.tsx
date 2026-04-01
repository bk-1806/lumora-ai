"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function LandingNav() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const initials = user?.email ? user.email.charAt(0).toUpperCase() : 'LA'

  return (
    <nav className="border-b border-white/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <div className="relative size-10 rounded-xl overflow-hidden shadow-sm border border-white">
              <Image
                src="/lumora-logo.png"
                alt="Lumora AI"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900 drop-shadow-sm">
              Lumora AI
            </span>
          </div>

          <div className="flex gap-6 items-center">
            <Link href="/upload" className="text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors duration-200">
              Try Now
            </Link>

            {loading ? (
              <div className="size-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              // Logged in — show avatar + dropdown
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
                      <p className="text-sm font-medium truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Logged out — show Login / Sign Up button
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
