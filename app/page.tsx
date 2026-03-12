'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import LoginPage from '@/components/ui/LoginPage'
import AcademicStudentForm from '@/components/forms/AcademicStudentForm'
import AcademicAdminForm from '@/components/forms/AcademicAdminForm'
import CareerStudentForm from '@/components/forms/CareerStudentForm'
import CareerAdminForm from '@/components/forms/CareerAdminForm'
import AcademicStudentResults from '@/components/results/AcademicStudentResults'
import AcademicAdminResults from '@/components/results/AcademicAdminResults'
import CareerStudentResults from '@/components/results/CareerStudentResults'
import CareerAdminResults from '@/components/results/CareerAdminResults'
import ChatPage from '@/components/ui/ChatPage'
import AdminPortal from '@/components/ui/AdminPortal'
import ResourcesPortal from '@/components/ui/ResourcesPortal'
import StudyPlannerPage from '@/components/ui/StudyPlannerPage'
import MentorPage from '@/components/ui/MentorPage'

type Page = 'academic' | 'career' | 'chat' | 'admin' | 'resources' | 'planner' | 'mentor'

const NAV: { id: Page; label: string; icon: string; adminOnly?: boolean; studentOnly?: boolean }[] = [
  { id: 'academic',  label: 'Academic',  icon: '📚' },
  { id: 'career',    label: 'Career',    icon: '🚀' },
  { id: 'planner',   label: 'Study Plan',icon: '📖', studentOnly: true },
  { id: 'mentor',    label: 'AI Mentor', icon: '🧑‍🏫', studentOnly: true },
  { id: 'resources', label: 'Resources', icon: '📂' },
  { id: 'chat',      label: 'AI Chat',   icon: '💬' },
  { id: 'admin',     label: 'Admin',     icon: '🛡️', adminOnly: true },
]

export default function Home() {
  const { user, role, loading, signOut } = useAuth()
  const [page, setPage]         = useState<Page>('academic')
  const [result, setResult]     = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError]       = useState('')
  const [toast, setToast]       = useState<{msg:string;type:'success'|'error'}|null>(null)

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem', background:'var(--bg)' }}>
        <div className="spinner spinner-lg" style={{ borderTopColor:'var(--accent)' }}/>
        <p style={{ color:'var(--text2)', fontSize:'.9rem' }}>Loading AcadIQ...</p>
      </div>
    )
  }

  if (!user) return <LoginPage />

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  const handleAnalyze = async (formData: any) => {
    setAnalyzing(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: page, role, data: formData })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Analysis failed')
      setResult(json.result)
      showToast('Analysis complete — report saved!')
      setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior:'smooth' }), 100)
    } catch (e: any) {
      setError(e.message)
      showToast(e.message, 'error')
    } finally {
      setAnalyzing(false)
    }
  }

  const changePage = (p: Page) => { setPage(p); setResult(null); setError('') }

  const isAdmin = role === 'admin'

  // Filter nav: admins see all except studentOnly; students see all except adminOnly
  const visibleNav = NAV.filter(n => {
    if (n.adminOnly && !isAdmin) return false
    if (n.studentOnly && isAdmin) return false
    return true
  })

  const pageInfo: Record<Page, { badge:string; badgeClass:string; title:string; desc:string }> = {
    academic:  { badge:'📚 Module 1',    badgeClass:'badge-academic',  title:'Academic & Campus Intelligence',  desc: isAdmin ? 'Review student academic performance & generate intervention reports' : 'Analyze marks, attendance & get personalized study strategies' },
    career:    { badge:'🚀 Module 2',    badgeClass:'badge-career',    title:'Career & Placement Intelligence', desc: isAdmin ? 'Student career summary, placement probability & action plans' : 'Job readiness score, skill gaps, salary bands & 6-month roadmap' },
    chat:      { badge:'💬 AI Chat',     badgeClass:'badge-chat',      title:'AI Assistant',                   desc:'Ask anything — academics, career, campus life, placement prep' },
    admin:     { badge:'🛡️ Admin',      badgeClass:'badge-admin',     title:'Admin Portal',                   desc:'View all student reports, analyze submissions & manage data' },
    resources: { badge:'📂 Resources',   badgeClass:'badge-resources', title:'Resource Library',               desc: isAdmin ? 'Upload and manage syllabus, PYQs, notes, timetables & more' : 'Access syllabus, PYQs, notes, timetables, brochures & events' },
    planner:   { badge:'📖 Study Plan',  badgeClass:'badge-academic',  title:'AI Study Planner',               desc:'Upload notes or PYQs — get a full AI study plan with priorities and daily schedule' },
    mentor:    { badge:'🧑‍🏫 AI Mentor', badgeClass:'badge-career',   title:'Personal AI Mentor',             desc:'Your AI mentor reviews all your reports and gives you personalized weekly guidance' },
  }

  const info = pageInfo[page]
  const avatar = user.user_metadata?.avatar_url
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  // Pages that handle their own layout entirely
  const fullPageRoutes: Page[] = ['chat', 'admin', 'resources', 'planner', 'mentor']

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo-mark">A</div>
          <div>
            <div className="logo-name">Acad<em>IQ</em></div>
            <div className="logo-tagline">Academic & Career Intelligence</div>
          </div>
        </div>
        <nav className="header-nav">
          {visibleNav.map(n => (
            <button key={n.id} className={`nav-btn ${page === n.id ? 'active' : ''}`} onClick={() => changePage(n.id)}>
              {n.icon} {n.label}
            </button>
          ))}
        </nav>
        <div className="header-right" style={{ gap:'.75rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
            {avatar
              ? <img src={avatar} alt={displayName} style={{ width:30, height:30, borderRadius:'50%', border:'2px solid var(--border2)' }}/>
              : <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.85rem', fontWeight:700, color:'#fff' }}>{displayName[0].toUpperCase()}</div>
            }
            <div style={{ display:'none' }} className="user-info-desktop">
              <div style={{ fontSize:'.8rem', fontWeight:600, lineHeight:1.2 }}>{displayName}</div>
              <div style={{ fontSize:'.68rem', color: isAdmin ? 'var(--yellow)' : 'var(--green)', fontWeight:600 }}>
                {isAdmin ? '🛡️ Admin' : '🎓 Student'}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={signOut} style={{ fontSize:'.78rem' }}>Sign out</button>
        </div>
      </header>

      <div className="layout-main">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">Navigation</div>
          {visibleNav.map(n => (
            <button key={n.id} className={`sidebar-btn ${page === n.id ? 'active' : ''}`} onClick={() => changePage(n.id)}>
              <span className="sidebar-icon">{n.icon}</span>{n.label}
            </button>
          ))}
          <div style={{ flex:1 }}/>
          <div style={{ padding:'.75rem', background:'var(--bg3)', borderRadius:10, margin:'.5rem 0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'.4rem' }}>
              {avatar
                ? <img src={avatar} alt="" style={{ width:28, height:28, borderRadius:'50%' }}/>
                : <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.75rem', fontWeight:700, color:'#fff' }}>{displayName[0].toUpperCase()}</div>
              }
              <div>
                <div style={{ fontSize:'.78rem', fontWeight:600, lineHeight:1.2 }}>{displayName}</div>
                <div style={{ fontSize:'.65rem', color: isAdmin ? 'var(--yellow)' : 'var(--green)', fontWeight:600 }}>
                  {isAdmin ? '🛡️ Admin' : '🎓 Student'}
                </div>
              </div>
            </div>
            <div style={{ fontSize:'.68rem', color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
            <button className="btn btn-ghost btn-sm" onClick={signOut} style={{ width:'100%', marginTop:'.6rem', fontSize:'.75rem', justifyContent:'center' }}>
              Sign out
            </button>
          </div>
        </aside>

        {/* Content */}
        {page === 'chat' ? (
          <ChatPage />
        ) : (
          <main className="page-content">
            {page === 'admin' ? (
              isAdmin ? <AdminPortal /> : <AccessDenied />
            ) : page === 'resources' ? (
              <ResourcesPortal role={role || 'student'} />
            ) : page === 'planner' ? (
              <StudyPlannerPage />
            ) : page === 'mentor' ? (
              <MentorPage />
            ) : (
              <>
                <div className="page-header">
                  <div className={`page-badge ${info.badgeClass}`}>{info.badge} — {isAdmin ? 'Admin' : 'Student'} View</div>
                  <h1 className="page-title">{info.title}</h1>
                  <p className="page-desc">{info.desc}</p>
                </div>

                {page === 'academic' && !isAdmin && <AcademicStudentForm onAnalyze={handleAnalyze} loading={analyzing}/>}
                {page === 'academic' &&  isAdmin && <AcademicAdminForm   onAnalyze={handleAnalyze} loading={analyzing}/>}
                {page === 'career'   && !isAdmin && <CareerStudentForm   onAnalyze={handleAnalyze} loading={analyzing}/>}
                {page === 'career'   &&  isAdmin && <CareerAdminForm     onAnalyze={handleAnalyze} loading={analyzing}/>}

                {error && (
                  <div className="info-box" style={{ marginTop:'1rem', background:'var(--red2)', color:'var(--red)', border:'1px solid rgba(240,91,91,.2)' }}>⚠ {error}</div>
                )}
                {analyzing && (
                  <div className="state-box">
                    <div className="spinner spinner-lg" style={{ borderTopColor:'var(--accent)' }}/>
                    <p className="state-text">Analyzing with AI — usually takes 5–10 seconds...</p>
                  </div>
                )}
                {result && !analyzing && (
                  <div id="results-section" style={{ marginTop:'2rem' }} className="anim-fade-up">
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
                      <h2 style={{ fontSize:'1.15rem', fontWeight:800 }}>Analysis Report</h2>
                      <span className="tag tag-green">✓ Saved to database</span>
                    </div>
                    {page === 'academic' && !isAdmin && <AcademicStudentResults data={result}/>}
                    {page === 'academic' &&  isAdmin && <AcademicAdminResults   data={result}/>}
                    {page === 'career'   && !isAdmin && <CareerStudentResults   data={result}/>}
                    {page === 'career'   &&  isAdmin && <CareerAdminResults     data={result}/>}
                  </div>
                )}
                {!result && !analyzing && (
                  <div className="state-box" style={{ paddingTop:'3rem' }}>
                    <div className="state-icon">{page === 'academic' ? '📚' : '🚀'}</div>
                    <p className="state-text">Fill in the form above and click Analyze to generate your report</p>
                  </div>
                )}
              </>
            )}
          </main>
        )}
      </div>

      {/* Mobile nav */}
      <nav className="mobile-nav">
        {visibleNav.map(n => (
          <button key={n.id} className={`mobile-nav-btn ${page === n.id ? 'active' : ''}`} onClick={() => changePage(n.id)}>
            <span className="mobile-nav-icon">{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
        </div>
      )}
    </div>
  )
}

function AccessDenied() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'1rem', textAlign:'center' }}>
      <div style={{ fontSize:'3.5rem' }}>🔒</div>
      <h2 style={{ fontSize:'1.5rem', fontWeight:800 }}>Access Denied</h2>
      <p style={{ color:'var(--text2)', fontSize:'.9rem', maxWidth:360, lineHeight:1.7 }}>
        <strong style={{ color:'var(--red)' }}>Admins Only.</strong><br/>
        Your account does not have admin privileges.
      </p>
      <div style={{ padding:'.75rem 1.25rem', background:'var(--red2)', border:'1px solid rgba(240,91,91,.2)', borderRadius:10, fontSize:'.8rem', color:'var(--red)', maxWidth:360 }}>
        Ask an admin to add your email to the <code style={{ fontFamily:'Fira Code,monospace' }}>admin_users</code> table in Supabase.
      </div>
    </div>
  )
}
