'use client'
const PC: Record<string,string> = { Low:'var(--red)', Medium:'var(--yellow)', High:'var(--green)' }
const OC: Record<string,string> = { Student:'var(--blue)', College:'var(--accent2)', Both:'var(--green)' }

export default function CareerAdminResults({ data }: any) {
  const prob = data.placementProbabilityIndicator || 'Medium'
  return (
    <div>
      <div className="stats-row">
        <div className="card card-sm">
          <div className="card-title">Readiness Score</div>
          <div className="card-value" style={{ color:'var(--accent)', fontSize:'1.5rem' }}>{data.overallReadinessScore}<span style={{ fontSize:'.9rem', color:'var(--text3)' }}>/100</span></div>
          <div className="card-sub">{data.studentCareerSummary?.name}</div>
        </div>
        <div className="card card-sm" style={{ borderColor:PC[prob]+'44' }}>
          <div className="card-title">Placement Probability</div>
          <div className="card-value" style={{ color:PC[prob], fontSize:'1.5rem' }}>{prob}</div>
          <div className="card-sub">{data.studentCareerSummary?.marketReadiness}</div>
        </div>
        <div className="card card-sm">
          <div className="card-title">Current Profile</div>
          <div className="card-value" style={{ fontSize:'.95rem' }}>{data.studentCareerSummary?.currentProfile}</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
        <div className="section" style={{ margin:0 }}>
          <div className="section-title">✅ Key Strengths</div>
          <ul className="item-list">{data.keyStrengths?.map((s:string,i:number)=><li key={i} style={{ color:'var(--green)' }}>{s}</li>)}</ul>
        </div>
        <div className="section" style={{ margin:0 }}>
          <div className="section-title">⚠ Risk Areas</div>
          {data.majorRiskAreas?.map((r:any,i:number)=>(
            <div key={i} style={{ marginBottom:'.6rem', padding:'.65rem', background:'rgba(240,91,91,.06)', borderRadius:'8px' }}>
              <div style={{ fontWeight:700, fontSize:'.875rem', color:'var(--red)', marginBottom:'.2rem' }}>{r.risk}</div>
              <div style={{ fontSize:'.78rem', color:'var(--text2)' }}>{r.impact}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-title">📋 Action Plan</div>
        {data.recommendedActionPlan?.map((item:any,i:number)=>(
          <div key={i} style={{ display:'flex', gap:'1rem', padding:'.75rem', background:'var(--bg2)', borderRadius:'8px', marginBottom:'.5rem', alignItems:'flex-start' }}>
            <span style={{ width:24,height:24,borderRadius:'50%',background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.7rem',fontWeight:800,flexShrink:0,color:'#fff' }}>{i+1}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:'.875rem', marginBottom:'.2rem' }}>{item.action}</div>
              <div style={{ fontSize:'.75rem', color:'var(--text3)', fontFamily:'Fira Code,monospace' }}>Timeline: {item.timeline}</div>
            </div>
            <span className="tag" style={{ background:OC[item.owner]+'22', color:OC[item.owner] }}>{item.owner}</span>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-title">📊 Placement Outlook</div>
        <p style={{ fontSize:'.875rem', color:'var(--text2)', lineHeight:1.8 }}>{data.placementOutlook}</p>
        {data.suggestedInterventions?.length > 0 && (
          <div style={{ marginTop:'1rem' }}>
            <div style={{ fontSize:'.72rem', color:'var(--text3)', fontWeight:700, textTransform:'uppercase', marginBottom:'.5rem' }}>Suggested Interventions</div>
            <ul className="item-list">{data.suggestedInterventions.map((s:string,i:number)=><li key={i}>{s}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  )
}
