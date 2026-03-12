'use client'
import { useEffect, useState } from 'react'

const POS_COLOR: Record<string,string> = {
  'Below Average':'var(--red)', 'Tier 3 Average':'var(--yellow)',
  'Above Average':'var(--blue)', 'Placement Ready':'var(--green)',
  'Product-Company Ready':'var(--accent2)', 'Elite Level':'#ffd700',
}

function MiniRing({ score, max, label, color }: any) {
  const r=36, c=2*Math.PI*r, d=(score/max)*c
  return (
    <div className="score-ring-mini">
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} fill="none" stroke="var(--bg)" strokeWidth="7"/>
        <circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${d} ${c}`} strokeLinecap="round" transform="rotate(-90 42 42)"/>
        <text x="42" y="39" textAnchor="middle" fill="var(--text)" fontSize="13" fontWeight="800" fontFamily="Plus Jakarta Sans">{score}</text>
        <text x="42" y="52" textAnchor="middle" fill="var(--text3)" fontSize="9" fontFamily="Fira Code">/{max}</text>
      </svg>
      <div className="score-ring-mini-label">{label}</div>
    </div>
  )
}

// Fetch resources that match a skill gap keyword
async function fetchMatchedResources(skillName: string) {
  try {
    const res = await fetch(`/api/resources?search=${encodeURIComponent(skillName)}`)
    const json = await res.json()
    return json.resources || []
  } catch {
    return []
  }
}

function SkillGapItem({ gap, index }: { gap: any; index: number }) {
  const [resources, setResources] = useState<any[]>([])
  const [loadingRes, setLoadingRes] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!gap.skill) return
    setLoadingRes(true)
    fetchMatchedResources(gap.skill).then(r => {
      setResources(r.slice(0, 3)) // max 3 suggestions per gap
      setChecked(true)
      setLoadingRes(false)
    })
  }, [gap.skill])

  const CAT_ICON: Record<string,string> = {
    syllabus:'📋', pyq:'📝', notes:'📓', timetable:'🗓️', brochure:'📄', event:'🎉', other:'📌'
  }

  return (
    <div className="gap-item">
      <div className="gap-title"><div className="gap-num">{index+1}</div>{gap.skill}</div>
      <div className="gap-row"><strong>Why it matters:</strong> {gap.whyItMatters}</div>
      <div className="gap-row"><strong style={{ color:'var(--red)' }}>Risk if ignored:</strong> {gap.riskIfIgnored}</div>
      <div className="gap-row"><strong style={{ color:'var(--green)' }}>Action:</strong> {gap.improvementAction}</div>

      {/* Matched resources */}
      {checked && resources.length > 0 && (
        <div style={{ marginTop:'.75rem', paddingTop:'.75rem', borderTop:'1px solid var(--border)' }}>
          <div style={{ fontSize:'.68rem', fontWeight:700, textTransform:'uppercase', color:'var(--accent)', letterSpacing:'.05em', marginBottom:'.5rem' }}>
            📂 Related Resources
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'.4rem' }}>
            {resources.map((r: any) => (
              <div key={r.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.5rem .75rem', background:'var(--bg3)', borderRadius:8, border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'.5rem', minWidth:0 }}>
                  <span style={{ fontSize:'.9rem', flexShrink:0 }}>{CAT_ICON[r.category] || '📌'}</span>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:'.8rem', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.title}</div>
                    {r.subject && <div style={{ fontSize:'.68rem', color:'var(--text3)' }}>{r.subject}{r.semester ? ` · Sem ${r.semester}` : ''}</div>}
                  </div>
                </div>
                {r.external_link && (
                  <a href={r.external_link} target="_blank" rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm" style={{ flexShrink:0, fontSize:'.72rem', marginLeft:'.5rem' }}>
                    Open →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {loadingRes && (
        <div style={{ marginTop:'.5rem', fontSize:'.75rem', color:'var(--text3)' }}>
          <div className="spinner" style={{ width:12, height:12, borderTopColor:'var(--accent)', display:'inline-block', marginRight:'.4rem' }}/>
          Checking resources...
        </div>
      )}
    </div>
  )
}

export default function CareerStudentResults({ data }: any) {
  const s = data.jobReadinessScore
  const bd = s?.breakdown || {}
  const pos = data.competitivePositioning?.classification || 'Tier 3 Average'
  const posColor = POS_COLOR[pos] || 'var(--text)'
  const scoreItems = [
    { key:'dsaStrength',          label:'DSA Strength',    max:20, color:'var(--blue)' },
    { key:'developmentSkills',    label:'Dev Skills',      max:20, color:'var(--green)' },
    { key:'projectDepth',         label:'Project Depth',   max:15, color:'var(--accent2)' },
    { key:'practicalExposure',    label:'Practical',       max:15, color:'var(--yellow)' },
    { key:'academicStrength',     label:'Academic',        max:10, color:'var(--blue)' },
    { key:'extracurricularImpact',label:'Extracurricular', max:5,  color:'var(--text2)' },
    { key:'marketCompetitiveness',label:'Market Fit',      max:15, color:'var(--red)' },
  ]

  return (
    <div>
      {/* Top 2 cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
        <div className="card">
          <div className="card-title">Job Readiness Score</div>
          <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', marginTop:'.5rem' }}>
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="45" fill="none" stroke="var(--bg)" strokeWidth="9"/>
              <circle cx="55" cy="55" r="45" fill="none" stroke="var(--accent)" strokeWidth="9"
                strokeDasharray={`${(s?.total/100)*283} 283`} strokeLinecap="round" transform="rotate(-90 55 55)"/>
              <text x="55" y="50" textAnchor="middle" fill="var(--text)" fontSize="20" fontWeight="800" fontFamily="Plus Jakarta Sans">{s?.total}</text>
              <text x="55" y="66" textAnchor="middle" fill="var(--text3)" fontSize="10" fontFamily="Fira Code">/100</text>
            </svg>
            <div>
              <div style={{ fontSize:'.72rem', color:'var(--text3)', marginBottom:'.3rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>Classification</div>
              <div style={{ color:posColor, fontWeight:800, fontSize:'1rem', marginBottom:'.5rem' }}>{pos}</div>
              <div style={{ fontSize:'.8rem', color:'var(--text2)', lineHeight:1.5 }}>{data.competitivePositioning?.reasoning}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Salary Band — India</div>
          <div style={{ marginTop:'.5rem' }}>
            {[{p:'Current Realistic',v:data.salaryBand?.current},{p:'12-Month (roadmap)',v:data.salaryBand?.twelveMonth},{p:'24-Month Projection',v:data.salaryBand?.twentyFourMonth}].map((row,i)=>(
              <div key={i} className="salary-row">
                <span className="salary-period">{row.p}</span>
                <span className="salary-value">₹ {row.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="section">
        <div className="section-title">📊 Score Breakdown</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem', justifyContent:'space-around', marginBottom:'1.25rem' }}>
          {scoreItems.map(item => <MiniRing key={item.key} score={bd[item.key]?.score??0} max={item.max} label={item.label} color={item.color}/>)}
        </div>
        {scoreItems.map(item => (
          <div key={item.key} className="prog-row">
            <span className="prog-label">{item.label}</span>
            <div className="prog-track">
              <div className="prog-fill" style={{ width:`${((bd[item.key]?.score??0)/item.max)*100}%`, background:item.color }}/>
            </div>
            <span className="prog-val" style={{ color:item.color }}>{bd[item.key]?.score??0}</span>
          </div>
        ))}
        {scoreItems.some(item => bd[item.key]?.note) && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'.4rem', marginTop:'1rem' }}>
            {scoreItems.map(item => bd[item.key]?.note && (
              <div key={item.key} style={{ fontSize:'.75rem', color:'var(--text2)', padding:'.4rem .6rem', background:'var(--bg2)', borderRadius:'6px' }}>
                <span style={{ color:item.color, fontWeight:700 }}>{item.label}:</span> {bd[item.key].note}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Gaps — now with matched resources */}
      <div className="section">
        <div className="section-title">🎯 Top Skill Gaps</div>
        <p style={{ fontSize:'.78rem', color:'var(--text3)', marginBottom:'1rem' }}>
          Resources from your college library are shown under each gap if available.
        </p>
        {data.skillGaps?.map((gap:any, i:number) => (
          <SkillGapItem key={i} gap={gap} index={i} />
        ))}
      </div>

      {/* Roadmap */}
      <div className="section">
        <div className="section-title">🗺 6-Month Roadmap</div>
        {data.roadmap && ['phase1','phase2','phase3'].map((ph) => {
          const p = data.roadmap[ph]; if(!p) return null
          return (
            <div key={ph} className="roadmap-phase">
              <div className="roadmap-phase-tag">Month {p.months}</div>
              <div className="roadmap-phase-title">{p.title}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:'.75rem' }}>
                {[
                  {label:'Skill Targets',    items:p.skillTargets,    color:'var(--accent2)'},
                  {label:'Measurable Goals', items:p.measurableGoals, color:'var(--green)'},
                  {label:'Project Upgrades', items:p.projectUpgrades, color:'var(--blue)'},
                  {label:'Interview Prep',   items:p.interviewPrep,   color:'var(--yellow)'},
                ].map(sec => (
                  <div key={sec.label}>
                    <div style={{ fontSize:'.65rem', fontWeight:700, textTransform:'uppercase', color:sec.color, marginBottom:'.35rem', letterSpacing:'.05em' }}>{sec.label}</div>
                    <ul className="item-list">{sec.items?.map((item:string,j:number)=><li key={j}>{item}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Career Growth + Placement */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        <div className="section" style={{ margin:0 }}>
          <div className="section-title">📈 12–24 Month Projection</div>
          {data.careerGrowth && [{period:'12 Months',d:data.careerGrowth.twelveMonth},{period:'24 Months',d:data.careerGrowth.twentyFourMonth}].map((item,i) => (
            <div key={i} style={{ marginBottom:'.875rem', padding:'.75rem', background:'var(--bg2)', borderRadius:'8px' }}>
              <div style={{ fontSize:'.68rem', fontFamily:'Fira Code,monospace', color:'var(--accent)', fontWeight:700, marginBottom:'.35rem' }}>{item.period}</div>
              <div style={{ fontWeight:700, marginBottom:'.25rem' }}>{item.d?.role}</div>
              <div style={{ fontSize:'.78rem', color:'var(--text2)', marginBottom:'.25rem' }}>{item.d?.skills}</div>
              <div style={{ fontSize:'.85rem', color:'var(--green)', fontWeight:700 }}>₹ {item.d?.salaryRange}</div>
            </div>
          ))}
        </div>
        <div className="section" style={{ margin:0 }}>
          <div className="section-title">🏢 Placement Intelligence</div>
          {data.placementIntelligence && <>
            <div style={{ display:'flex', gap:'.5rem', marginBottom:'.875rem', flexWrap:'wrap' }}>
              <span className={`tag ${data.placementIntelligence.eligibilityProbability==='High'?'tag-green':data.placementIntelligence.eligibilityProbability==='Medium'?'tag-yellow':'tag-red'}`}>
                Eligibility: {data.placementIntelligence.eligibilityProbability}
              </span>
              <span className="tag tag-blue">{data.placementIntelligence.suitableCompanyType}</span>
            </div>
            <div style={{ marginBottom:'.875rem' }}>
              <div style={{ fontSize:'.7rem', color:'var(--text3)', fontWeight:700, textTransform:'uppercase', marginBottom:'.35rem' }}>Target Roles</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.35rem' }}>
                {data.placementIntelligence.targetRoles?.map((r:string,i:number) => <span key={i} className="tag tag-purple">{r}</span>)}
              </div>
            </div>
            <div className="info-box" style={{ background:'var(--red2)', color:'var(--red)', border:'1px solid rgba(240,91,91,.2)', fontSize:'.8rem' }}>
              <strong>Gap Summary:</strong> {data.placementIntelligence.readinessGapSummary}
            </div>
          </>}
        </div>
      </div>
    </div>
  )
}
