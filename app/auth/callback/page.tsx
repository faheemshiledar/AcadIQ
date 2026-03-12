'use client'
/**
 * This MUST be a client page, NOT a server route.
 *
 * Why: Google redirects here with ?code=xxx in the URL.
 * With flowType:'pkce', Supabase JS reads that code from the URL
 * and calls exchangeCodeForSession() automatically — but only
 * if JavaScript runs on this page BEFORE any server-side redirect
 * strips the code away.
 *
 * A server route (route.ts) redirects before JS runs = code is lost = login loop.
 * A client page (page.tsx) runs JS first = code is exchanged = session saved.
 */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('Completing sign-in...')

  useEffect(() => {
    let redirected = false

    const go = () => {
      if (!redirected) {
        redirected = true
        router.replace('/')
      }
    }

    // Listen for the SIGNED_IN event — fires when exchangeCodeForSession succeeds
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        setStatus('Success! Redirecting...')
        go()
      }
    })

    // Also check if session already exists (e.g. page reloaded)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setStatus('Sign-in failed. Redirecting...')
        setTimeout(go, 1500)
        return
      }
      if (session) {
        setStatus('Success! Redirecting...')
        go()
      }
    })

    // Hard fallback — if nothing fires in 6 seconds, go home anyway
    const fallback = setTimeout(() => {
      setStatus('Taking longer than expected...')
      go()
    }, 6000)

    return () => {
      clearTimeout(fallback)
      subscription.unsubscribe()
    }
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.25rem',
      background: '#07080f',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
    }}>
      {/* Logo */}
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: 'linear-gradient(135deg, #5b6af0, #8b98ff)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.3rem', fontWeight: 800, color: '#fff',
        marginBottom: '0.5rem',
      }}>A</div>

      {/* Spinner */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.08)',
        borderTopColor: '#5b6af0',
        animation: 'spin 0.7s linear infinite',
      }}/>

      <p style={{ color: '#8e8ea8', fontSize: '0.9rem', letterSpacing: '0.01em' }}>
        {status}
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
