'use client'
import { useState, useEffect, useCallback } from 'react'
import AcademicStudentResults from '@/components/results/AcademicStudentResults'
import AcademicAdminResults from '@/components/results/AcademicAdminResults'
import CareerStudentResults from '@/components/results/CareerStudentResults'
import CareerAdminResults from '@/components/results/CareerAdminResults'

type Report = {
  id: string; created_at: string; student_name: string; roll_number: string;
  module: string; risk_level: string; readiness_score: number;
  input_data: any; result_data: any;
}

const RC: Record<string,string> = { Low:'tag-green', Medium:'tag-yellow', High:'tag-red' }

export default function AdminPortal() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string|null>(null)
  const [deleting, setDeleting] = useState<string|null>(null)
  const [error, setError] = useState('')

  const fetch_ = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const p = new URLSearchParams()
      if (filter !== 'all') p.set('module', filter)
      if (search) p.set('search', search)
      const res = await fetch(`/api/reports?${p}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setReports(json.reports || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [filter, search])

  useEffect(() => { fetch_() }, [fetch_])

  const deleteReport = async (id: string) => {
    if (!confirm('Delete this report permanently?')) return
    setDeleting(id)
    try {
      await fetch('/api/reports', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id}) })
      setReports(p => p.filter(r => r.id !== id))
      if (expanded === id) setExpanded(null)
    } catch {}
    setDeleting(null)
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })

  return (
    <div>
      <div className="page-header">
        <div className="page-badge badge-admin">🛡️ Admin Portal</div>
        <h1 className="page-title">Student Reports Dashboard</h1>
        <p className="page-desc">All student analysis reports saved from the Academic & Career modules</p>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ marginBottom:'1.5rem' }}>
        {[
          { label:'Total Reports', val:reports.length, color:'var(--text)' },
          { label:'Academic', val:reports.filter(r=>r.module==='academic').length, color:'var(--green)' },
          { label:'Career', val:reports.filter(r=>r.module==='career').length, color:'var(--accent2)' },
          { label:'High Risk', val:reports.filter(r=>r.risk_level==='High').length, color:'var(--red)' },
        ].map((s,i) => (
          <div key={i} className="card card-sm">
            <div className="card-title">{s.label}</div>
            <div className="card-value" style={{ color:s.color, fontSize:'1.5rem' }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'.75rem', marginBottom:'1rem', flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', gap:'.35rem' }}>
          {['all','academic','career'].map(f => (
            <button key={f} className={`cat-btn ${filter===f?'active':''}`} onClick={() => setFilter(f)} style={{ textTransform:'capitalize' }}>{f}</button>
          ))}
        </div>
        <div className="search-wrap" style={{ flex:1, minWidth:200, marginBottom:0 }}>
          <span className="search-icon">🔍</span>
          <input className="form-input" placeholder="Search student name..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetch_()} />
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetch_}>↻ Refresh</button>
      </div>

      {error && <div className="info-box" style={{ background:'var(--red2)', color:'var(--red)', border:'1px solid rgba(240,91,91,.2)', marginBottom:'1rem' }}>⚠ {error} — Check your Supabase configuration.</div>}

      {loading ? (
        <div className="state-box"><div className="spinner spinner-lg" style={{ borderTopColor:'var(--accent)' }}/><p className="state-text">Loading reports...</p></div>
      ) : reports.length === 0 ? (
        <div className="state-box">
          <div className="state-icon">📋</div>
          <p className="state-text">No reports found. Reports are saved automatically when students submit their analysis.</p>
        </div>
      ) : (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          {reports.map((r, i) => (
            <div key={r.id}>
              <div className="report-row" onClick={() => setExpanded(expanded===r.id?null:r.id)}>
                <div style={{ flex:1 }}>
                  <div className="report-student">{r.student_name}</div>
                  <div className="report-meta">{r.roll_number && `${r.roll_number} · `}{formatDate(r.created_at)}</div>
                </div>
                <span className={`tag ${r.module==='academic'?'tag-green':'tag-purple'}`} style={{ textTransform:'capitalize' }}>{r.module}</span>
                {r.risk_level && <span className={`tag ${RC[r.risk_level]||'tag-blue'}`}>Risk: {r.risk_level}</span>}
                {r.readiness_score && <span className="tag tag-blue">Score: {r.readiness_score}/100</span>}
                <button className="btn btn-danger btn-sm" style={{ padding:'.25rem .6rem' }} onClick={e=>{e.stopPropagation();deleteReport(r.id)}} disabled={deleting===r.id}>
                  {deleting===r.id?<div className="spinner"/>:'✕'}
                </button>
                <span style={{ color:'var(--text3)', fontSize:'.9rem', transition:'transform .2s', transform:expanded===r.id?'rotate(180deg)':'none' }}>▾</span>
              </div>

              {expanded === r.id && (
                <div className="report-expand" style={{ padding:'1.25rem' }}>
                  {/* Input summary */}
                  <div style={{ marginBottom:'1.25rem', padding:'1rem', background:'var(--bg2)', borderRadius:'8px' }}>
                    <div style={{ fontSize:'.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--text3)', marginBottom:'.75rem' }}>Student Input Data</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'.5rem' }}>
                      {Object.entries(r.input_data).filter(([k,v])=>v&&typeof v!=='object'&&!['s1','s2','s3','s4','s5','m1','m2','m3','m4','m5'].includes(k)).map(([k,v]:any)=>(
                        <div key={k} style={{ fontSize:'.78rem' }}>
                          <span style={{ color:'var(--text3)', textTransform:'capitalize' }}>{k.replace(/([A-Z])/g,' $1')}: </span>
                          <span style={{ color:'var(--text)', fontWeight:500 }}>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Results */}
                  <div style={{ fontSize:'.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--text3)', marginBottom:'1rem' }}>Analysis Result</div>
                  {r.module==='academic' && r.result_data?.academicRiskLevel && <AcademicStudentResults data={r.result_data}/>}
                  {r.module==='academic' && r.result_data?.riskFlag && <AcademicAdminResults data={r.result_data}/>}
                  {r.module==='career'   && r.result_data?.jobReadinessScore && <CareerStudentResults data={r.result_data}/>}
                  {r.module==='career'   && r.result_data?.overallReadinessScore && <CareerAdminResults data={r.result_data}/>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
