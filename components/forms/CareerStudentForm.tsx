'use client'
import { useState } from 'react'

export default function CareerStudentForm({ onAnalyze, loading }: any) {
  const [f, setF] = useState({
    studentName:'', branch:'', semester:'', cgpa:'',
    skills:'', techStack:'', githubSummary:'', leetcodeStats:'',
    projects:'', internships:'', certifications:'',
    openSourceContributions:'', hackathons:'', extracurriculars:'',
    targetRole:'', targetCompanyType:''
  })
  const up = (k:string) => (e:any) => setF(p=>({...p,[k]:e.target.value}))

  return (
    <div className="card">
      <div className="form-grid">
        <div className="form-group"><label className="form-label">Student Name *</label><input className="form-input" placeholder="e.g. Priya Nair" value={f.studentName} onChange={up('studentName')} /></div>
        <div className="form-group"><label className="form-label">Branch</label><input className="form-input" placeholder="e.g. CSE, IT, ECE" value={f.branch} onChange={up('branch')} /></div>
        <div className="form-group"><label className="form-label">Semester</label>
          <select className="form-select" value={f.semester} onChange={up('semester')}>
            <option value="">Select</option>
            {[1,2,3,4,5,6,7,8].map(s=><option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">CGPA</label><input className="form-input" type="number" step="0.1" min="0" max="10" placeholder="e.g. 7.8" value={f.cgpa} onChange={up('cgpa')} /></div>
        <div className="form-group col-span-2"><label className="form-label">Technical Skills (comma-separated)</label><input className="form-input" placeholder="Python, JavaScript, React, Node.js, SQL, Git" value={f.skills} onChange={up('skills')} /></div>
        <div className="form-group col-span-2"><label className="form-label">Primary Tech Stack / Frameworks</label><input className="form-input" placeholder="MERN Stack, Django, Spring Boot, Flutter" value={f.techStack} onChange={up('techStack')} /></div>
        <div className="form-group col-span-2">
          <label className="form-label">GitHub Summary</label>
          <textarea className="form-textarea" placeholder="e.g. 15 repos, 3 original projects, 200 contributions this year, 8 forked repos, no PRs to open source" value={f.githubSummary} onChange={up('githubSummary')} />
        </div>
        <div className="form-group col-span-2"><label className="form-label">LeetCode Statistics</label><input className="form-input" placeholder="e.g. 120 solved — Easy: 70, Medium: 45, Hard: 5 | Rating: 1450" value={f.leetcodeStats} onChange={up('leetcodeStats')} /></div>
        <div className="form-group col-span-2">
          <label className="form-label">Projects (brief description of each)</label>
          <textarea className="form-textarea" placeholder="1. E-commerce site (React, Node.js) — basic CRUD, no deployment&#10;2. Weather app (API integration)&#10;3. College chatbot (Python, basic NLP)" value={f.projects} onChange={up('projects')} />
        </div>
        <div className="form-group col-span-2">
          <label className="form-label">Internships / Work Experience</label>
          <textarea className="form-textarea" placeholder="e.g. 2-month web dev intern at local startup (June 2024) — built landing pages. OR: None" value={f.internships} onChange={up('internships')} />
        </div>
        <div className="form-group"><label className="form-label">Certifications</label><input className="form-input" placeholder="AWS Cloud Practitioner, Meta React, etc." value={f.certifications} onChange={up('certifications')} /></div>
        <div className="form-group"><label className="form-label">Open Source Contributions</label><input className="form-input" placeholder="None / 2 merged PRs" value={f.openSourceContributions} onChange={up('openSourceContributions')} /></div>
        <div className="form-group"><label className="form-label">Hackathons / Competitions</label><input className="form-input" placeholder="2 hackathons, no wins" value={f.hackathons} onChange={up('hackathons')} /></div>
        <div className="form-group"><label className="form-label">Extracurriculars (relevant)</label><input className="form-input" placeholder="Tech club lead, IEEE member" value={f.extracurriculars} onChange={up('extracurriculars')} /></div>
        <div className="form-group">
          <label className="form-label">Target Role</label>
          <select className="form-select" value={f.targetRole} onChange={up('targetRole')}>
            <option value="">Select role</option>
            {['SDE','Frontend Developer','Backend Developer','Full Stack Developer','Data Analyst','Data Scientist','DevOps Engineer','Mobile Developer','Open to any'].map(r=><option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Target Company Type</label>
          <select className="form-select" value={f.targetCompanyType} onChange={up('targetCompanyType')}>
            <option value="">Select</option>
            <option value="Service">Service (TCS, Infosys, Wipro)</option>
            <option value="Product">Product (Google, Microsoft, etc.)</option>
            <option value="Startup">Startup</option>
            <option value="Any">Any / Not sure</option>
          </select>
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop:'1.25rem' }} onClick={() => onAnalyze(f)} disabled={loading||!f.studentName}>
        {loading ? <><div className="spinner"></div> Analyzing...</> : '🚀 Analyze Career Readiness'}
      </button>
    </div>
  )
}
