'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type Role = 'student' | 'admin' | null

interface AuthCtx {
  user: User | null
  session: Session | null
  role: Role
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  user: null, session: null, role: null, loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role,    setRole]    = useState<Role>(null)
  const [loading, setLoading] = useState(true)
  const roleCache = useRef<Record<string, Role>>({})

  async function resolveRole(email: string): Promise<Role> {
    // Cache per session so we don't hammmer the API on every re-render
    if (roleCache.current[email]) return roleCache.current[email]
    try {
      const res = await fetch('/api/check-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      const r: Role = json.role === 'admin' ? 'admin' : 'student'
      roleCache.current[email] = r
      return r
    } catch {
      return 'student'
    }
  }

  useEffect(() => {
    // onAuthStateChange fires FIRST on mount with the current session (or null)
    // This is the single source of truth — don't rely on getSession separately
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user?.email) {
          const r = await resolveRole(session.user.email)
          setRole(r)
        } else {
          setRole(null)
        }

        // Always stop loading after first event fires
        setLoading(false)
      }
    )

    // Safety net: if onAuthStateChange never fires within 3s, stop loading
    // (shouldn't happen but prevents infinite spinner)
    const timeout = setTimeout(() => setLoading(false), 3000)

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signOut = async () => {
    roleCache.current = {}
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
