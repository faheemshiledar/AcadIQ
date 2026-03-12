'use client'
import { useState } from 'react'

export default function AcademicStudentForm({ onAnalyze, loading }: any) {
  const [f, setF] = useState({
    studentName:'', semester:'', cgpa:'', attendance:'', backlogs:'0',
    studyHoursPerDay:'', learningStyle:'', challenges:'', clubsJoined:'', eventsAttended:'',
    s1:'', m1:'', s2:'', m2:'', s3:'', m3:'', s4:'', m4:'', s5:'', m5:''
  })
  const up = (k:string) => (e:any) => setF(p=>({...p,[k]:e.target.value}))

  const submit = () => {
    const subjects = [1,2,3,4,5].flatMap(i => {
      const s = (f as any)[`s${i}`], m = (f as any)[`m${i}`]
      return s && m ? [{ subject: s, marks: parseInt(m) }] : []
    })
    onAnalyze({ ...f, subjects, cgpa: parseFloat(f.cgpa)||0, attendance: parseFloat(f.attendance)||0 })
  }

  return (
    <div className="card">
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Student Name *</label>
          <input className="form-input" placeholder="e.g. Rahul Sharma" value={f.studentName} onChange={up('studentName')} />
        </div>
        <div className="form-group">
          <label className="form-label">Semester *</label>
          <select className="form-select" value={f.semester} onChange={up('semester')}>
            <option value="">Select semester</option>
            {[1,2,3,4,5,6,7,8].map(s=><option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Current CGPA</label>
          <input className="form-input" type="number" min="0" max="10" step="0.1" placeholder="e.g. 7.2" value={f.cgpa} onChange={up('cgpa')} />
        </div>
        <div className="form-group">
          <label className="form-label">Attendance %</label>
          <input className="form-input" type="number" min="0" max="100" placeholder="e.g. 78" value={f.attendance} onChange={up('attendance')} />
        </div>
        <div className="form-group">
          <label className="form-label">Active Backlogs</label>
          <input className="form-input" type="number" min="0" placeholder="0" value={f.backlogs} onChange={up('backlogs')} />
        </div>
        <div className="form-group">
          <label className="form-label">Study Hours / Day</label>
          <input className="form-input" type="number" min="0" max="16" placeholder="e.g. 3" value={f.studyHoursPerDay} onChange={up('studyHoursPerDay')} />
        </div>
      </div>

      <hr className="divider" />
      <p className="form-label" style={{ marginBottom:'.75rem' }}>Subject-wise Marks (out of 100)</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'.75rem', marginBottom:'1rem' }}>
        {[1,2,3,4,5].map(i=>(
          <div key={i} style={{ display:'flex', flexDirection:'column', gap:'.35rem' }}>
            <input className="form-input" placeholder={`Subject ${i} name`} value={(f as any)[`s${i}`]} onChange={up(`s${i}`)} />
            <input className="form-input" type="number" min="0" max="100" placeholder="Marks /100" value={(f as any)[`m${i}`]} onChange={up(`m${i}`)} />
          </div>
        ))}
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Clubs / Committees</label>
          <input className="form-input" placeholder="e.g. Coding Club, NSS, IEEE" value={f.clubsJoined} onChange={up('clubsJoined')} />
        </div>
        <div className="form-group">
          <label className="form-label">Events Attended</label>
          <input className="form-input" placeholder="e.g. Hackathon, Tech Fest" value={f.eventsAttended} onChange={up('eventsAttended')} />
        </div>
        <div className="form-group">
          <label className="form-label">Learning Style</label>
          <select className="form-select" value={f.learningStyle} onChange={up('learningStyle')}>
            <option value="">Select style</option>
            <option value="visual">Visual (videos, diagrams)</option>
            <option value="reading">Reading / Writing</option>
            <option value="practice">Practice-based</option>
            <option value="group">Group study</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Main Challenges</label>
          <input className="form-input" placeholder="e.g. Time management, focus issues" value={f.challenges} onChange={up('challenges')} />
        </div>
      </div>

      <button className="btn btn-primary" style={{ marginTop:'1.25rem' }} onClick={submit} disabled={loading||!f.studentName||!f.semester}>
        {loading ? <><div className="spinner"></div> Analyzing...</> : '🔍 Analyze Academic Profile'}
      </button>
    </div>
  )
}
