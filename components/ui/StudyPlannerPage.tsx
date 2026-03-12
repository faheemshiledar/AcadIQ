'use client'
import { useState, useRef } from 'react'

const PRIORITY_COLOR: Record<string, string> = {
  High:   'var(--red)',
  Medium: 'var(--yellow)',
  Low:    'var(--green)',
}
const PRIORITY_BG: Record<string, string> = {
  High:   'var(--red2)',
  Medium: 'var(--yellow2)',
  Low:    'var(--green2)',
}

interface SizeError {
  pages: number
  characters: number
  maxPages: number
  maxChars: number
  message: string
}

export default function StudyPlannerPage() {
  const [file, setFile]           = useState<File | null>(null)
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState<any>(null)
  const [sizeError, setSizeError] = useState<SizeError | null>(null)
  const [error, setError]         = useState('')
  const [dragOver, setDragOver]   = useState(false)
  const [docMeta, setDocMeta]     = useState<{pages:number, chars:number} | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setResult(null)
    setSizeError(null)
    setError('')
    setDocMeta(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const analyze = async (forcePartial = false) => {
    if (!file) return
    setLoading(true); setError(''); setSizeError(null); setResult(null)

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('forcePartial', String(forcePartial))

      const res = await fetch('/api/study-planner', { method: 'POST', body: fd })
      const json = await res.json()

      if (res.status === 413 && json.error === 'too_large') {
        setSizeError({
          pages:      json.pages,
          characters: json.characters,
          maxPages:   json.maxPages,
          maxChars:   json.maxChars,
          message:    json.message,
        })
        return
      }

      if (!res.ok) throw new Error(json.error || 'Analysis failed')

      setDocMeta({ pages: json.pages, chars: json.characters })
      setResult(json.result)
      setTimeout(() => document.getElementById('planner-results')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null); setResult(null); setSizeError(null); setError(''); setDocMeta(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-badge badge-academic">📖 AI Study Planner — Student Tool</div>
        <h1 className="page-title">AI Study Planner</h1>
        <p className="page-desc">Upload your notes, PYQs, or study material — get a full AI-generated study plan with topic priorities, daily schedule, and exam tips.</p>
      </div>

      {!result && (
        <div className="section">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : file ? 'var(--green)' : 'var(--border2)'}`,
              borderRadius: 'var(--radius)',
              padding: '2.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all .2s',
              background: dragOver ? 'rgba(91,106,240,.06)' : file ? 'var(--green2)' : 'var(--bg2)',
              marginBottom: '1.25rem',
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt"
              style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {file ? (
              <>
                <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>📄</div>
                <div style={{ fontWeight: 700, marginBottom: '.25rem' }}>{file.name}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text2)' }}>
                  {(file.size / 1024).toFixed(1)} KB · Click to change
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>📂</div>
                <div style={{ fontWeight: 700, marginBottom: '.4rem' }}>Drop your document here</div>
                <div style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: '.75rem' }}>
                  Supports PDF and TXT files
                </div>
                <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['Chapter Notes', 'PYQ Paper', 'Study Material', 'Lecture Notes'].map(t => (
                    <span key={t} className="tag tag-blue">{t}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Limits info */}
          <div className="info-box info-box-blue" style={{ marginBottom: '1rem', fontSize: '.8rem' }}>
            <strong>Document limits:</strong> Max 8 pages · Max 20,000 characters.
            Larger documents can be analyzed using only the first 8 pages.
          </div>

          {/* Size error */}
          {sizeError && (
            <div style={{
              background: 'var(--red2)', border: '1px solid rgba(240,91,91,.25)',
              borderRadius: 'var(--radius2)', padding: '1.25rem', marginBottom: '1rem',
            }}>
              <div style={{ fontWeight: 800, color: 'var(--red)', marginBottom: '.75rem', fontSize: '.95rem' }}>
                ⚠ Document Too Large
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.5rem', marginBottom: '.875rem' }}>
                {[
                  { label: 'Pages',      value: sizeError.pages,                       limit: `Max ${sizeError.maxPages}`,                   over: sizeError.pages > sizeError.maxPages },
                  { label: 'Characters', value: sizeError.characters.toLocaleString(), limit: `Max ${sizeError.maxChars.toLocaleString()}`,   over: sizeError.characters > sizeError.maxChars },
                  { label: 'Status',     value: 'Too Large',                            limit: 'Exceeds limits',                              over: true },
                ].map(item => (
                  <div key={item.label} style={{
                    padding: '.75rem', borderRadius: 8,
                    background: item.over ? 'rgba(240,91,91,.12)' : 'var(--bg3)',
                    border: `1px solid ${item.over ? 'rgba(240,91,91,.2)' : 'var(--border)'}`,
                  }}>
                    <div style={{ fontSize: '.65rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '.25rem' }}>{item.label}</div>
                    <div style={{ fontWeight: 800, color: item.over ? 'var(--red)' : 'var(--text)', fontSize: '.95rem' }}>{item.value}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--text3)', marginTop: '.15rem' }}>{item.limit}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '.82rem', color: 'var(--text2)', marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--red)' }}>Reason:</strong> {sizeError.message}
              </div>
              <button
                className="btn btn-primary"
                onClick={() => analyze(true)}
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? '⏳ Analyzing...' : '✂ Analyze First 8 Pages Only'}
              </button>
            </div>
          )}

          {error && !sizeError && (
            <div className="info-box" style={{ background: 'var(--red2)', color: 'var(--red)', border: '1px solid rgba(240,91,91,.2)', marginBottom: '1rem' }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '.75rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => analyze(false)}
              disabled={!file || loading}
              style={{ flex: 1 }}
            >
              {loading
                ? <><div className="spinner" style={{ borderTopColor: '#fff', width: 16, height: 16 }}/> Analyzing document...</>
                : '🧠 Generate Study Plan'
              }
            </button>
            {file && (
              <button className="btn btn-ghost" onClick={reset}>Clear</button>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="state-box">
          <div className="spinner spinner-lg" style={{ borderTopColor: 'var(--accent)' }}/>
          <p className="state-text">Reading your document and building your study plan...</p>
          <p style={{ color: 'var(--text3)', fontSize: '.78rem' }}>This usually takes 8–15 seconds</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div id="planner-results" className="anim-fade-up">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '.3rem' }}>Study Plan Generated</h2>
              {docMeta && (
                <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>
                  Analyzed {docMeta.pages} page{docMeta.pages !== 1 ? 's' : ''} · {docMeta.chars.toLocaleString()} characters
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="tag tag-purple">{result.documentType}</span>
              <span className="tag tag-blue">⏱ ~{result.estimatedStudyHours}h total</span>
              <span className="tag tag-green">{result.totalTopics} topics</span>
              <button className="btn btn-ghost btn-sm" onClick={reset}>↩ New Document</button>
            </div>
          </div>

          {/* Document title */}
          {result.documentTitle && (
            <div className="section" style={{ padding: '.875rem 1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '.68rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.25rem' }}>Document</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{result.documentTitle}</div>
            </div>
          )}

          {/* Topics grid */}
          <div className="section">
            <div className="section-title">📋 Topics & Priority</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '.875rem' }}>
              {result.topics?.map((topic: any, i: number) => (
                <div key={i} style={{
                  background: 'var(--bg2)', border: `1px solid var(--border)`,
                  borderLeft: `3px solid ${PRIORITY_COLOR[topic.priority] || 'var(--accent)'}`,
                  borderRadius: 'var(--radius2)', padding: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.6rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{topic.name}</div>
                    <span style={{
                      fontSize: '.65rem', fontWeight: 700, padding: '.2rem .5rem', borderRadius: 4,
                      background: PRIORITY_BG[topic.priority], color: PRIORITY_COLOR[topic.priority],
                    }}>{topic.priority}</span>
                  </div>
                  <div style={{ fontSize: '.72rem', color: 'var(--accent)', fontFamily: 'Fira Code, monospace', marginBottom: '.6rem' }}>
                    ⏱ {topic.estimatedHours}h
                  </div>

                  {topic.keyConcepts?.length > 0 && (
                    <div style={{ marginBottom: '.6rem' }}>
                      <div style={{ fontSize: '.65rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '.3rem' }}>Key Concepts</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
                        {topic.keyConcepts.map((c: string, j: number) => (
                          <span key={j} style={{ fontSize: '.7rem', padding: '.15rem .45rem', background: 'var(--bg3)', borderRadius: 4, color: 'var(--text2)' }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {topic.studyTips?.length > 0 && (
                    <div style={{ marginBottom: '.6rem' }}>
                      <div style={{ fontSize: '.65rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '.3rem' }}>Study Tips</div>
                      <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                        {topic.studyTips.map((t: string, j: number) => (
                          <li key={j} style={{ fontSize: '.78rem', color: 'var(--text2)', marginBottom: '.2rem' }}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.likelyExamQuestions?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '.65rem', color: 'var(--yellow)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '.3rem' }}>Likely Exam Questions</div>
                      <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                        {topic.likelyExamQuestions.map((q: string, j: number) => (
                          <li key={j} style={{ fontSize: '.75rem', color: 'var(--yellow)', marginBottom: '.2rem' }}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Daily Plan */}
          {result.dailyPlan?.length > 0 && (
            <div className="section">
              <div className="section-title">📅 Daily Study Schedule</div>
              <div style={{ display: 'grid', gap: '.6rem' }}>
                {result.dailyPlan.map((day: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '.875rem', background: 'var(--bg2)', borderRadius: 'var(--radius2)', border: '1px solid var(--border)' }}>
                    <div style={{ textAlign: 'center', minWidth: 52 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem', fontWeight: 800, color: '#fff', margin: '0 auto .3rem' }}>
                        D{day.day}
                      </div>
                      <div style={{ fontSize: '.65rem', color: 'var(--text3)', fontFamily: 'Fira Code, monospace' }}>{day.hours}h</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: '.4rem', fontSize: '.9rem' }}>{day.focus}</div>
                      <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                        {day.tasks?.map((t: string, j: number) => (
                          <li key={j} style={{ fontSize: '.8rem', color: 'var(--text2)', marginBottom: '.2rem' }}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom row: Strategy + Quick Revision + Warnings */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: '1rem' }}>
            {result.overallStrategy && (
              <div className="section" style={{ margin: 0 }}>
                <div className="section-title">🎯 Overall Strategy</div>
                <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.7 }}>{result.overallStrategy}</p>
              </div>
            )}

            {result.quickRevisionPoints?.length > 0 && (
              <div className="section" style={{ margin: 0 }}>
                <div className="section-title">⚡ Quick Revision Points</div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {result.quickRevisionPoints.map((p: string, i: number) => (
                    <li key={i} style={{ fontSize: '.82rem', color: 'var(--text2)', marginBottom: '.4rem', lineHeight: 1.5 }}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.warningAreas?.length > 0 && (
              <div className="section" style={{ margin: 0 }}>
                <div className="section-title">⚠ Areas to Watch</div>
                {result.warningAreas.map((w: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-start', marginBottom: '.5rem' }}>
                    <span style={{ color: 'var(--red)', marginTop: '.1rem', flexShrink: 0 }}>⚠</span>
                    <span style={{ fontSize: '.82rem', color: 'var(--text2)', lineHeight: 1.5 }}>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
