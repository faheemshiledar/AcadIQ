'use client'
import { useState } from 'react'

const TREND_COLOR: Record<string, string> = {
  Improving: 'var(--green)',
  Stable:    'var(--yellow)',
  Declining: 'var(--red)',
  'No Data': 'var(--text3)',
}

export default function MentorPage() {
  const [rollNumber, setRollNumber]   = useState('')
  const [studentName, setStudentName] = useState('')
  const [loading, setLoading]         = useState(false)
  const [result, setResult]           = useState<any>(null)
  const [error, setError]             = useState('')

  const fetch_mentor = async () => {
    if (!rollNumber.trim() && !studentName.trim()) {
      setError('Enter your Roll Number or Name to continue.')
      return
    }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNumber:  rollNumber.trim() || undefined,
          studentName: studentName.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Mentor fetch failed')
      setResult(json)
      setTimeout(() => document.getElementById('mentor-result')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-badge badge-career">🧑‍🏫 Personal AI Mentor</div>
        <h1 className="page-title">Personal AI Mentor</h1>
        <p className="page-desc">Your AI mentor analyzes all your past reports and gives you a personalized weekly focus, priority skills, and tailored advice.</p>
      </div>

      {/* Input card */}
      <div className="section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text2)', display: 'block', marginBottom: '.4rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>
              Roll Number
            </label>
            <input
              className="input"
              type="text"
              placeholder="e.g. CS2024001"
              value={rollNumber}
              onChange={e => setRollNumber(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetch_mentor()}
            />
          </div>
          <div>
            <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text2)', display: 'block', marginBottom: '.4rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>
              Or Student Name
            </label>
            <input
              className="input"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetch_mentor()}
            />
          </div>
        </div>

        <div className="info-box info-box-blue" style={{ marginBottom: '1rem', fontSize: '.8rem' }}>
          Your mentor uses all your previous Academic and Career analyses to give personalized advice. Make sure you've run at least one analysis first.
        </div>

        {error && (
          <div className="info-box" style={{ background: 'var(--red2)', color: 'var(--red)', border: '1px solid rgba(240,91,91,.2)', marginBottom: '1rem' }}>
            ⚠ {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={fetch_mentor}
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading
            ? <><div className="spinner" style={{ borderTopColor: '#fff', width: 16, height: 16 }}/> Consulting your mentor...</>
            : '🧑‍🏫 Get My Weekly Mentorship'
          }
        </button>
      </div>

      {loading && (
        <div className="state-box">
          <div className="spinner spinner-lg" style={{ borderTopColor: 'var(--accent)' }}/>
          <p className="state-text">Your mentor is reviewing all your reports...</p>
        </div>
      )}

      {result && !loading && (
        <div id="mentor-result" className="anim-fade-up">
          {/* Student header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', padding: '1rem 1.25rem', background: 'var(--bg3)', borderRadius: 'var(--radius)', border: '1px solid var(--border2)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
              🧑‍🏫
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>{result.student_name}</div>
              <div style={{ fontSize: '.78rem', color: 'var(--text2)' }}>
                {result.reports_count} report{result.reports_count !== 1 ? 's' : ''} analyzed · Personal AI Mentor
              </div>
            </div>
          </div>

          {/* Progress summary */}
          {result.progress_summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '.75rem', marginBottom: '1rem' }}>
              {[
                { label: 'Academic Trend',  value: result.progress_summary.academic_trend,       color: TREND_COLOR[result.progress_summary.academic_trend] || 'var(--text)' },
                { label: 'Career Trend',    value: result.progress_summary.career_trend,         color: TREND_COLOR[result.progress_summary.career_trend] || 'var(--text)' },
                { label: 'Academic Risk',   value: result.progress_summary.latest_academic_risk  || 'N/A', color: result.progress_summary.latest_academic_risk === 'High' ? 'var(--red)' : result.progress_summary.latest_academic_risk === 'Medium' ? 'var(--yellow)' : 'var(--green)' },
                { label: 'Career Score',    value: result.progress_summary.latest_career_score != null ? `${result.progress_summary.latest_career_score}/100` : 'N/A', color: 'var(--accent)' },
              ].map(item => (
                <div key={item.label} className="card card-sm" style={{ textAlign: 'center' }}>
                  <div className="card-title" style={{ textAlign: 'center' }}>{item.label}</div>
                  <div style={{ fontWeight: 800, color: item.color, fontSize: '1rem' }}>{item.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Weekly focus */}
          <div className="section" style={{ borderLeft: '3px solid var(--accent)', marginBottom: '1rem' }}>
            <div className="section-title">🎯 This Week's Focus</div>
            <p style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.6 }}>{result.weekly_focus}</p>
          </div>

          {/* Mentor message */}
          <div className="section" style={{ marginBottom: '1rem', background: 'rgba(91,106,240,.06)', border: '1px solid rgba(91,106,240,.15)' }}>
            <div className="section-title" style={{ color: 'var(--accent2)' }}>💬 Mentor's Message</div>
            <p style={{ fontSize: '.88rem', color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{result.mentor_message}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {/* Priority skills */}
            {result.priority_skills?.length > 0 && (
              <div className="section" style={{ margin: 0 }}>
                <div className="section-title">⚡ Priority Skills</div>
                {result.priority_skills.map((skill: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '.6rem', alignItems: 'center', padding: '.5rem .6rem', background: 'var(--bg2)', borderRadius: 8, marginBottom: '.4rem' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: '.85rem', fontWeight: 600 }}>{skill}</span>
                  </div>
                ))}
              </div>
            )}

            {/* This week tasks */}
            {result.this_week_tasks?.length > 0 && (
              <div className="section" style={{ margin: 0 }}>
                <div className="section-title">✅ This Week's Tasks</div>
                {result.this_week_tasks.map((task: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-start', marginBottom: '.5rem' }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0, marginTop: '.1rem' }}>◆</span>
                    <span style={{ fontSize: '.82rem', color: 'var(--text2)', lineHeight: 1.5 }}>{task}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Encouragement */}
          {result.encouragement && (
            <div className="info-box info-box-green" style={{ textAlign: 'center', fontSize: '.875rem', fontStyle: 'italic' }}>
              ✨ {result.encouragement}
            </div>
          )}

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setResult(null); setRollNumber(''); setStudentName('') }}>
              ↩ Check Another Student
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
