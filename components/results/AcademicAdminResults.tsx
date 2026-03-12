'use client'
const RC: Record<string,string> = { Low:'var(--green)', Medium:'var(--yellow)', High:'var(--red)' }
const UC: Record<string,string> = { Immediate:'var(--red)', Soon:'var(--yellow)', Routine:'var(--green)' }

export default function AcademicAdminResults({ data }: any) {
  const risk = data.riskFlag || 'Medium'
  return (
    <div>
      <div className="stats-row">
        <div className="card card-sm" style={{ borderColor:RC[risk]+'44' }}>
          <div className="card-title">Risk Flag</div>
          <div className="card-value" style={{ color:RC[risk], fontSize:'1.5rem' }}>{risk}</div>
          <div className="card-sub">{data.studentSummary?.overallStatus}</div>
        </div>
        <div className="card card-sm">
          <div className="card-title">Trend</div>
          <div className="card-value" style={{ fontSize:'1.1rem' }}>{data.studentSummary?.performanceTrend || '—'}</div>
          <div className="card-sub">{data.studentSummary?.name}</div>
        </div>
        <div className="card card-sm">
          <div className="card-title">Avg Marks</div>
          <div className="card-value" style={{ fontSize:'1.5rem' }}>{data.academicMetrics?.averageMarks ?? '—'}</div>
          <div className="card-sub">out of 100</div>
        </div>
        <div className="card card-sm">
          <div className="card-title">Parent Contact</div>
          <div className="card-value" style={{ fontSize:'1rem', color: data.parentCommunication?.required?'var(--red)':'var(--green)' }}>
            {data.parentCommunication?.required ? 'Required' : 'Not Needed'}
          </div>
          <div className="card-sub">{data.parentCommunication?.reason}</div>
        </div>
      </div>

      {data.riskFactors?.length > 0 && (
        <div className="section" style={{ borderColor:'rgba(240,91,91,.2)' }}>
          <div className="section-title">🚩 Risk Factors</div>
          <ul className="item-list">{data.riskFactors.map((r:string,i:number) => <li key={i} style={{ color:'var(--red)' }}>{r}</li>)}</ul>
        </div>
      )}

      <div className="section">
        <div className="section-title">🛠 Intervention Suggestions</div>
        {data.interventionSuggestions?.map((item:any, i:number) => (
          <div key={i} style={{ display:'flex', gap:'.875rem', padding:'.75rem', background:'var(--bg2)', borderRadius:'8px', marginBottom:'.5rem', alignItems:'flex-start' }}>
            <span className="tag" style={{ background:UC[item.urgency]+'22', color:UC[item.urgency], flexShrink:0 }}>{item.urgency}</span>
            <div>
              <div style={{ fontWeight:700, fontSize:'.875rem', marginBottom:'.25rem' }}>{item.type}</div>
              <div style={{ fontSize:'.8rem', color:'var(--text2)', marginBottom:'.2rem' }}>{item.action}</div>
              <div style={{ fontSize:'.75rem', color:'var(--green)' }}>Expected: {item.expectedOutcome}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-title">📄 Advisory Report</div>
        <p style={{ fontSize:'.875rem', color:'var(--text2)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{data.advisoryReport}</p>
        {data.recommendedFollowUp && (
          <div className="info-box info-box-blue" style={{ marginTop:'1rem' }}>
            <strong>Follow-up:</strong> {data.recommendedFollowUp}
          </div>
        )}
      </div>
    </div>
  )
}
