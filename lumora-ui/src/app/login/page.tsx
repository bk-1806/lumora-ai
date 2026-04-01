"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabaseClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (tab === 'signin') {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      } else {
        const { error } = await supabaseClient.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Account created! Check your email to confirm, then sign in.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #f8fbff 0%, #eef3ff 50%, #e9ecff 100%)' }}
    >
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c8cff 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image src="/lumora-logo.png" alt="Lumora AI" width={36} height={36} className="rounded-lg object-contain" />
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#7c8cff] to-[#5fa9ff]">
            Lumora AI
          </span>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-gray-100/80 p-1 mb-6">
          <button
            onClick={() => { setTab('signin'); setError(null); setSuccess(null) }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              tab === 'signin' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setError(null); setSuccess(null) }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              tab === 'signup' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
              {success}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7c8cff]/40 focus:border-[#7c8cff] transition-all text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7c8cff]/40 focus:border-[#7c8cff] transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #7c8cff, #5fa9ff)', boxShadow: '0 4px 15px rgba(124,140,255,0.35)' }}
          >
            {loading
              ? (tab === 'signin' ? 'Signing in...' : 'Creating account...')
              : (tab === 'signin' ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to Lumora AI&apos;s{' '}
          <a href="#" className="text-[#7c8cff] hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-[#7c8cff] hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
