'use client'

const RC: Record<string, string> = { Low:'var(--green)', Medium:'var(--yellow)', High:'var(--red)' }
const AC: Record<string, string> = { Good:'var(--green)', Warning:'var(--yellow)', Critical:'var(--red)' }
const PC: Record<string, string> = { High:'var(--red)', Medium:'var(--yellow)', Low:'var(--green)' }
const PBG: Record<string, string> = { High:'var(--red2)', Medium:'var(--yellow2)', Low:'var(--green2)' }

const RES_ICON: Record<string, string> = {
  YouTube: '▶', Website: '🌐', Course: '🎓', Practice: '💻'
}
const RES_COLOR: Record<string, string> = {
  YouTube: 'var(--red)', Website: 'var(--blue)', Course: 'var(--accent2)', Practice: 'var(--green)'
}

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

export default function AcademicStudentResults({ data }: any) {
  const risk = data.academicRiskLevel || 'Medium'

  return (
    <div>
      {/* ── Top stat cards ── */}
      <div className="stats-row">
        <div className="card card-sm" style={{ borderColor: RC[risk]+'44' }}>
          <div className="card-title">Academic Risk</div>
          <div className="card-value" style={{ color: RC[risk], fontSize:'1.5rem' }}>{risk}</div>
          <div className="card-sub">{data.riskReason}</div>
        </div>
        <div className="card card-sm">
          <div className="card-title">Overall Score</div>
          <div className="card-value" style={{ fontSize:'1.5rem' }}>{data.overallPercentage ?? '—'}%</div>
          <div className="card-sub">Aggregate marks</div>
        </div>
        <div className="card card-sm">
          <div className="card-title">Attendance</div>
          <div className="card-value" style={{ color: AC[data.attendanceStatus], fontSize:'1.5rem' }}>{data.attendanceStatus || '—'}</div>
          <div className="card-sub">{data.attendanceNote}</div>
        </div>
        <div className="card card-sm">
          <div className="card-title">Daily Study</div>
          <div className="card-value" style={{ fontSize:'1.5rem' }}>{data.weeklyStudyPlan?.hoursPerDay ?? '—'}<span style={{ fontSize:'1rem', color:'var(--text3)' }}>h/day</span></div>
          <div className="card-sub">Recommended</div>
        </div>
      </div>

      {/* ── Immediate actions ── */}
      {data.immediateActions?.length > 0 && (
        <div className="section" style={{ borderLeft:'3px solid var(--red)', marginBottom:'1rem' }}>
          <div className="section-title" style={{ color:'var(--red)' }}>⚡ Immediate Actions Required</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'.5rem' }}>
            {data.immediateActions.map((action: string, i: number) => (
              <div key={i} style={{ display:'flex', gap:'.6rem', alignItems:'flex-start', padding:'.6rem .75rem', background:'var(--red2)', borderRadius:8, border:'1px solid rgba(240,91,91,.15)' }}>
                <span style={{ color:'var(--red)', flexShrink:0, fontWeight:700 }}>{i+1}.</span>
                <span style={{ fontSize:'.82rem', color:'var(--text)', lineHeight:1.5 }}>{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Platform recommendations ── */}
      {data.platformRecommendations && (
        <div className="section" style={{ marginBottom:'1rem', background:'rgba(91,106,240,.06)', border:'1px solid rgba(91,106,240,.18)' }}>
          <div className="section-title" style={{ color:'var(--accent2)' }}>🔧 AcadIQ Features That Can Help You</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'.75rem' }}>
            {[
              { icon:'📖', label:'Study Planner', tip: data.platformRecommendations.studyPlannerSuggestion, color:'var(--accent)' },
              { icon:'🧑‍🏫', label:'AI Mentor',    tip: data.platformRecommendations.mentorSuggestion,       color:'var(--green)' },
              { icon:'📂', label:'Resources',     tip: data.platformRecommendations.resourceLibrarySuggestion, color:'var(--yellow)' },
            ].map(item => item.tip && (
              <div key={item.label} style={{ padding:'.875rem', background:'var(--bg2)', borderRadius:10, border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'.4rem' }}>
                  <span style={{ fontSize:'1.1rem' }}>{item.icon}</span>
                  <span style={{ fontWeight:700, fontSize:'.85rem', color: item.color }}>{item.label}</span>
                </div>
                <p style={{ fontSize:'.8rem', color:'var(--text2)', lineHeight:1.6, margin:0 }}>{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Subjects needing attention — rich cards ── */}
      {data.subjectsNeedingAttention?.length > 0 && (
        <div className="section">
          <div className="section-title">⚠ Subjects Needing Attention</div>
          {data.subjectsNeedingAttention.map((s: any, i: number) => (
            <div key={i} style={{ background:'var(--bg2)', border:`1px solid var(--border)`, borderLeft:`3px solid ${PC[s.priority]||'var(--accent)'}`, borderRadius:'var(--radius2)', padding:'1.1rem', marginBottom:'.875rem' }}>

              {/* Subject header */}
              <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'.875rem', flexWrap:'wrap' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'.6rem', marginBottom:'.3rem' }}>
                    <span style={{ fontWeight:800, fontSize:'1rem' }}>{s.subject}</span>
                    <span style={{ fontSize:'.68rem', fontWeight:700, padding:'.18rem .5rem', borderRadius:4, background:PBG[s.priority], color:PC[s.priority] }}>{s.priority} Priority</span>
                  </div>
                  <div style={{ fontSize:'.75rem', color:'var(--text3)', fontFamily:'Fira Code,monospace' }}>{s.marks}/100 marks</div>
                </div>
                <div style={{ width:56, flexShrink:0 }}>
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="22" fill="none" stroke="var(--bg)" strokeWidth="5"/>
                    <circle cx="28" cy="28" r="22" fill="none" stroke={s.marks<40?'var(--red)':s.marks<60?'var(--yellow)':'var(--green)'} strokeWidth="5"
                      strokeDasharray={`${(s.marks/100)*138} 138`} strokeLinecap="round" transform="rotate(-90 28 28)"/>
                    <text x="28" y="32" textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight="800" fontFamily="Plus Jakarta Sans">{s.marks}%</text>
                  </svg>
                </div>
              </div>

              {/* Progress bar */}
              <div className="prog-track" style={{ marginBottom:'.875rem' }}>
                <div className="prog-fill" style={{ width:`${s.marks}%`, background: s.marks<40?'var(--red)':s.marks<60?'var(--yellow)':'var(--green)' }}/>
              </div>

              {/* Issue + root cause */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem', marginBottom:'.875rem' }}>
                <div style={{ padding:'.65rem .75rem', background:'var(--bg3)', borderRadius:8 }}>
                  <div style={{ fontSize:'.65rem', fontWeight:700, textTransform:'uppercase', color:'var(--text3)', marginBottom:'.25rem' }}>Issue</div>
                  <div style={{ fontSize:'.82rem', color:'var(--text2)', lineHeight:1.5 }}>{s.issue}</div>
                </div>
                {s.rootCause && (
                  <div style={{ padding:'.65rem .75rem', background:'var(--red2)', borderRadius:8 }}>
                    <div style={{ fontSize:'.65rem', fontWeight:700, textTransform:'uppercase', color:'var(--red)', marginBottom:'.25rem' }}>Root Cause</div>
                    <div style={{ fontSize:'.82rem', color:'var(--text2)', lineHeight:1.5 }}>{s.rootCause}</div>
                  </div>
                )}
              </div>

              {/* Improvement steps */}
              {s.improvementSteps?.length > 0 && (
                <div style={{ marginBottom:'.875rem' }}>
                  <div style={{ fontSize:'.68rem', fontWeight:700, textTransform:'uppercase', color:'var(--green)', marginBottom:'.4rem', letterSpacing:'.04em' }}>✅ How to Improve — Step by Step</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'.3rem' }}>
                    {s.improvementSteps.map((step: string, j: number) => (
                      <div key={j} style={{ display:'flex', gap:'.6rem', alignItems:'flex-start', padding:'.45rem .6rem', background:'var(--green2)', borderRadius:7 }}>
                        <span style={{ color:'var(--green)', fontWeight:700, flexShrink:0, minWidth:18, fontSize:'.8rem' }}>{j+1}.</span>
                        <span style={{ fontSize:'.8rem', color:'var(--text)', lineHeight:1.5 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External resources */}
              {s.externalResources?.length > 0 && (
                <div style={{ marginBottom: s.platformTip ? '.875rem' : 0 }}>
                  <div style={{ fontSize:'.68rem', fontWeight:700, textTransform:'uppercase', color:'var(--blue)', marginBottom:'.4rem', letterSpacing:'.04em' }}>🔗 Where to Study This</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem' }}>
                    {s.externalResources.map((r: any, j: number) => (
                      <a key={j} href={r.url} target="_blank" rel="noopener noreferrer"
                        style={{
                          display:'inline-flex', alignItems:'center', gap:'.35rem',
                          padding:'.3rem .65rem', borderRadius:6, textDecoration:'none',
                          background: RES_COLOR[r.type]+'18',
                          border:`1px solid ${RES_COLOR[r.type]}33`,
                          color: RES_COLOR[r.type],
                          fontSize:'.75rem', fontWeight:600, transition:'opacity .15s',
                        }}
                        onMouseEnter={e=>(e.currentTarget as any).style.opacity='.75'}
                        onMouseLeave={e=>(e.currentTarget as any).style.opacity='1'}
                      >
                        <span>{RES_ICON[r.type]||'🔗'}</span>
                        {r.name}
                        <span style={{ fontSize:'.65rem', opacity:.7 }}>{r.type}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform tip */}
              {s.platformTip && (
                <div style={{ display:'flex', gap:'.5rem', alignItems:'flex-start', padding:'.6rem .75rem', background:'rgba(91,106,240,.1)', borderRadius:8, border:'1px solid rgba(91,106,240,.2)', marginTop: s.externalResources?.length > 0 ? '.5rem' : 0 }}>
                  <span style={{ fontSize:'.9rem', flexShrink:0 }}>💡</span>
                  <span style={{ fontSize:'.78rem', color:'var(--accent3)', lineHeight:1.6 }}>{s.platformTip}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Study strategies ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
        <div className="section" style={{ margin:0 }}>
          <div className="section-title">📖 Study Strategies</div>
          {data.studyStrategies?.map((s: any, i: number) => (
            <div key={i} style={{ padding:'.875rem', background:'var(--bg2)', borderRadius:8, marginBottom:'.5rem' }}>
              <div style={{ fontWeight:700, fontSize:'.9rem', marginBottom:'.35rem' }}>{s.strategy}</div>
              {s.howToExecute && (
                <div style={{ fontSize:'.78rem', color:'var(--text2)', lineHeight:1.5, marginBottom:'.4rem' }}>{s.howToExecute}</div>
              )}
              <div style={{ fontSize:'.775rem', color:'var(--green)', marginBottom:'.2rem' }}>🎯 {s.measurableGoal}</div>
              <div style={{ fontSize:'.72rem', color:'var(--text3)', marginBottom: s.toolSuggestion ? '.4rem' : 0 }}>⏱ {s.timeframe}</div>
              {s.toolSuggestion && (
                <div style={{ fontSize:'.72rem', color:'var(--accent2)', padding:'.35rem .5rem', background:'rgba(139,152,255,.1)', borderRadius:5, lineHeight:1.5 }}>
                  🔧 {s.toolSuggestion}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Campus engagement */}
        <div className="section" style={{ margin:0 }}>
          <div className="section-title">🎓 Campus Engagement</div>
          {data.campusEngagement && <>
            <div style={{ marginBottom:'.75rem' }}>
              <div style={{ fontSize:'.7rem', color:'var(--text3)', fontWeight:700, textTransform:'uppercase', marginBottom:'.35rem' }}>Clubs</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.35rem' }}>
                {data.campusEngagement.suggestedClubs?.map((c:string,i:number) => <span key={i} className="tag tag-purple">{c}</span>)}
              </div>
            </div>
            <div style={{ marginBottom:'.75rem' }}>
              <div style={{ fontSize:'.7rem', color:'var(--text3)', fontWeight:700, textTransform:'uppercase', marginBottom:'.35rem' }}>Events</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.35rem' }}>
                {data.campusEngagement.suggestedEvents?.map((e:string,i:number) => <span key={i} className="tag tag-blue">{e}</span>)}
              </div>
            </div>
            <div>
              <div style={{ fontSize:'.7rem', color:'var(--text3)', fontWeight:700, textTransform:'uppercase', marginBottom:'.35rem' }}>Skill Building</div>
              <ul className="item-list">{data.campusEngagement.skillBuilding?.map((s:string,i:number) => <li key={i}>{s}</li>)}</ul>
            </div>
          </>}
        </div>
      </div>

      {/* ── Weekly plan ── */}
      {data.weeklyStudyPlan && (
        <div className="section">
          <div className="section-title">📅 Weekly Study Plan</div>
          {data.weeklyStudyPlan.dailyBreakdown?.length > 0 ? (
            <div style={{ display:'grid', gap:'.5rem', marginBottom:'1rem' }}>
              {data.weeklyStudyPlan.dailyBreakdown.map((d: any, i: number) => (
                <div key={i} style={{ display:'flex', gap:'.875rem', alignItems:'flex-start', padding:'.75rem', background:'var(--bg2)', borderRadius:8, border:'1px solid var(--border)' }}>
                  <div style={{ textAlign:'center', minWidth:48 }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem', fontWeight:700, color:'#fff', margin:'0 auto .25rem', lineHeight:1 }}>
                      {(d.day||'').slice(0,3).toUpperCase()}
                    </div>
                    <div style={{ fontSize:'.65rem', color:'var(--text3)', fontFamily:'Fira Code,monospace' }}>{d.hours}h</div>
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'.85rem', marginBottom:'.2rem' }}>{d.focus}</div>
                    <div style={{ fontSize:'.78rem', color:'var(--text2)', lineHeight:1.5 }}>{d.activity}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
              <div>
                <div style={{ fontSize:'.72rem', color:'var(--text3)', fontWeight:700, textTransform:'uppercase', marginBottom:'.4rem' }}>Focus Areas</div>
                <ul className="item-list">{data.weeklyStudyPlan.focusAreas?.map((f:string,i:number) => <li key={i}>{f}</li>)}</ul>
              </div>
              <div>
                <div style={{ fontSize:'.72rem', color:'var(--text3)', fontWeight:700, textTransform:'uppercase', marginBottom:'.4rem' }}>Review Schedule</div>
                <p style={{ fontSize:'.875rem', color:'var(--text2)', lineHeight:1.6 }}>{data.weeklyStudyPlan.reviewSchedule}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Key insights ── */}
      {data.keyInsights?.length > 0 && (
        <div className="section">
          <div className="section-title">💡 Key Insights</div>
          <ul className="item-list">{data.keyInsights.map((ins:string,i:number) => <li key={i}>{ins}</li>)}</ul>
        </div>
      )}
    </div>
  )
}
