'use client'
import { useState } from 'react'

export default function CareerAdminForm({ onAnalyze, loading }: any) {
  const [f, setF] = useState({
    studentName:'', rollNumber:'', branch:'', semester:'', cgpa:'',
    skills:'', githubSummary:'', leetcodeStats:'', projects:'',
    internships:'', certifications:'', communicationSkills:'',
    targetCompanyTier:'', notes:''
  })
  const up = (k:string) => (e:any) => setF(p=>({...p,[k]:e.target.value}))

  return (
    <div className="card">
      <div className="info-box info-box-yellow" style={{ marginBottom:'1.25rem', fontSize:'.8rem' }}>
        🔒 Placement Cell — Confidential career assessment record
      </div>
      <div className="form-grid">
        <div className="form-group"><label className="form-label">Student Name *</label><input className="form-input" placeholder="Full name" value={f.studentName} onChange={up('studentName')} /></div>
        <div className="form-group"><label className="form-label">Roll Number</label><input className="form-input" placeholder="e.g. 2021CS101" value={f.rollNumber} onChange={up('rollNumber')} /></div>
        <div className="form-group"><label className="form-label">Branch</label><input className="form-input" placeholder="e.g. CSE" value={f.branch} onChange={up('branch')} /></div>
        <div className="form-group"><label className="form-label">CGPA</label><input className="form-input" type="number" step="0.1" min="0" max="10" placeholder="e.g. 7.2" value={f.cgpa} onChange={up('cgpa')} /></div>
        <div className="form-group col-span-2"><label className="form-label">Technical Skills</label><input className="form-input" placeholder="Java, Python, React, SQL" value={f.skills} onChange={up('skills')} /></div>
        <div className="form-group col-span-2"><label className="form-label">GitHub Summary</label><input className="form-input" placeholder="10 repos, 3 projects, 150 contributions" value={f.githubSummary} onChange={up('githubSummary')} /></div>
        <div className="form-group col-span-2"><label className="form-label">LeetCode Statistics</label><input className="form-input" placeholder="80 solved (Easy:50, Med:28, Hard:2)" value={f.leetcodeStats} onChange={up('leetcodeStats')} /></div>
        <div className="form-group col-span-2"><label className="form-label">Projects</label><textarea className="form-textarea" placeholder="Brief description of key projects" value={f.projects} onChange={up('projects')} /></div>
        <div className="form-group col-span-2"><label className="form-label">Internships</label><input className="form-input" placeholder="1 internship, 2 months, web dev" value={f.internships} onChange={up('internships')} /></div>
        <div className="form-group">
          <label className="form-label">Communication Skills</label>
          <select className="form-select" value={f.communicationSkills} onChange={up('communicationSkills')}>
            <option value="">Select</option>
            {['Poor','Average','Good','Excellent'].map(v=><option key={v} value={v.toLowerCase()}>{v}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Target Company Tier</label>
          <select className="form-select" value={f.targetCompanyTier} onChange={up('targetCompanyTier')}>
            <option value="">Select</option>
            <option value="tier1">Tier 1 (FAANG/top product)</option>
            <option value="tier2">Tier 2 (Mid-product)</option>
            <option value="tier3">Tier 3 (Service companies)</option>
            <option value="startup">Startup ecosystem</option>
          </select>
        </div>
        <div className="form-group col-span-2">
          <label className="form-label">Additional Notes</label>
          <textarea className="form-textarea" placeholder="Any context about this student's career preparation..." value={f.notes} onChange={up('notes')} />
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop:'1rem' }} onClick={() => onAnalyze(f)} disabled={loading||!f.studentName}>
        {loading ? <><div className="spinner"></div> Generating...</> : '📊 Generate Career Report'}
      </button>
    </div>
  )
}
