'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (e: any) {
      setError('Sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '1.5rem',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(91,106,240,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }}/>

      <div style={{
        width: '100%', maxWidth: 420, position: 'relative', zIndex: 1,
      }} className="anim-fade-up">

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800, color: '#fff',
            margin: '0 auto 1rem', boxShadow: '0 8px 32px rgba(91,106,240,0.35)',
          }}>A</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-.03em', marginBottom: '.4rem' }}>
            Acad<span style={{ color: 'var(--accent2)' }}>IQ</span>
          </div>
          <div style={{ fontSize: '.9rem', color: 'var(--text2)' }}>
            Academic & Career Intelligence Platform
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border2)',
          borderRadius: 20, padding: '2rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '.4rem' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '.875rem', color: 'var(--text2)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Sign in with your Google account to access your academic and career dashboard.
          </p>

          {/* Google Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '.875rem', padding: '.875rem 1.25rem', borderRadius: 12,
              border: '1px solid var(--border3)', background: 'var(--bg3)',
              color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all .2s', opacity: loading ? .6 : 1,
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as any).style.background = 'var(--bg4)' }}
            onMouseLeave={e => { (e.currentTarget as any).style.background = 'var(--bg3)' }}
          >
            {loading ? (
              <div className="spinner" style={{ borderTopColor: 'var(--accent)' }}/>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? 'Redirecting to Google...' : 'Continue with Google'}
          </button>

          {error && (
            <div style={{
              marginTop: '1rem', padding: '.75rem 1rem', borderRadius: 8,
              background: 'var(--red2)', color: 'var(--red)',
              border: '1px solid rgba(240,91,91,.2)', fontSize: '.825rem',
            }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg3)', borderRadius: 10 }}>
            <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text3)', marginBottom: '.5rem' }}>
              How roles work
            </div>
            <div style={{ fontSize: '.8rem', color: 'var(--text2)', lineHeight: 1.7 }}>
              <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.25rem' }}>
                <span style={{ color: 'var(--green)', fontWeight: 600 }}>Student</span>
                <span>— any Google account</span>
              </div>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>Admin</span>
                <span>— approved email addresses only</span>
              </div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '.775rem', color: 'var(--text3)', lineHeight: 1.6 }}>
          Your session is secured by Supabase Auth.<br/>
          We only access your name and email address.
        </p>
      </div>
    </div>
  )
}
