"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function LandingNav() {
  const { user, setShowAuthModal, signOut } = useAuth()

  return (
    <nav className="border-b border-[#d0d8ff]/50 bg-white/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Image
              src="/lumora-logo.png"
              alt="Lumora AI"
              width={36}
              height={36}
              className="rounded-lg object-contain shadow-[0_0_15px_rgba(124,140,255,0.4)]"
            />
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              Lumora AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/analyze" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
              Try Analyzer
            </Link>
            
            <div className="h-4 w-px bg-border hidden sm:block"></div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="size-8 border border-border cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                    <AvatarFallback className="text-xs font-semibold text-primary" style={{ backgroundColor: "#EEF2FF" }}>
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">User</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard"><DropdownMenuItem className="cursor-pointer">Dashboard</DropdownMenuItem></Link>
                  <DropdownMenuItem onClick={signOut} className="text-red-500 cursor-pointer">Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowAuthModal(true)}>
                Log In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
