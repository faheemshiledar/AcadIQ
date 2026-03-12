'use client'
import { useState } from 'react'

export default function AcademicAdminForm({ onAnalyze, loading }: any) {
  const [f, setF] = useState({
    studentName:'', rollNumber:'', department:'', semester:'',
    cgpa:'', previousSemesterCGPA:'', attendance:'', backlogs:'0',
    subjectMarks:'', disciplinaryIssues:'', counselingHistory:'',
    parentContactStatus:'', notes:''
  })
  const up = (k:string) => (e:any) => setF(p=>({...p,[k]:e.target.value}))
  return (
    <div className="card">
      <div className="info-box info-box-yellow" style={{ marginBottom:'1.25rem', fontSize:'.8rem' }}>
        🔒 Admin View — Confidential student record. Report will be saved to admin portal.
      </div>
      <div className="form-grid">
        <div className="form-group"><label className="form-label">Student Name *</label><input className="form-input" placeholder="Full name" value={f.studentName} onChange={up('studentName')} /></div>
        <div className="form-group"><label className="form-label">Roll Number</label><input className="form-input" placeholder="e.g. 2021CS101" value={f.rollNumber} onChange={up('rollNumber')} /></div>
        <div className="form-group"><label className="form-label">Department</label><input className="form-input" placeholder="e.g. Computer Science" value={f.department} onChange={up('department')} /></div>
        <div className="form-group"><label className="form-label">Semester</label>
          <select className="form-select" value={f.semester} onChange={up('semester')}>
            <option value="">Select</option>
            {[1,2,3,4,5,6,7,8].map(s=><option key={s} value={s}>Sem {s}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Current CGPA</label><input className="form-input" type="number" step="0.1" min="0" max="10" placeholder="e.g. 6.1" value={f.cgpa} onChange={up('cgpa')} /></div>
        <div className="form-group"><label className="form-label">Previous Semester CGPA</label><input className="form-input" type="number" step="0.1" min="0" max="10" placeholder="e.g. 6.8" value={f.previousSemesterCGPA} onChange={up('previousSemesterCGPA')} /></div>
        <div className="form-group"><label className="form-label">Attendance %</label><input className="form-input" type="number" min="0" max="100" placeholder="e.g. 62" value={f.attendance} onChange={up('attendance')} /></div>
        <div className="form-group"><label className="form-label">Active Backlogs</label><input className="form-input" type="number" min="0" placeholder="0" value={f.backlogs} onChange={up('backlogs')} /></div>
        <div className="form-group col-span-2">
          <label className="form-label">Subject-wise Marks (Subject:Marks, comma-separated)</label>
          <input className="form-input" placeholder="Math:45, OS:72, DBMS:38, CN:55, SE:61" value={f.subjectMarks} onChange={up('subjectMarks')} />
        </div>
        <div className="form-group"><label className="form-label">Disciplinary Issues</label><input className="form-input" placeholder="None / brief description" value={f.disciplinaryIssues} onChange={up('disciplinaryIssues')} /></div>
        <div className="form-group"><label className="form-label">Counseling History</label><input className="form-input" placeholder="None / sessions count" value={f.counselingHistory} onChange={up('counselingHistory')} /></div>
        <div className="form-group">
          <label className="form-label">Parent Contact Status</label>
          <select className="form-select" value={f.parentContactStatus} onChange={up('parentContactStatus')}>
            <option value="">Select</option>
            <option value="not_required">Not Required</option>
            <option value="pending">Pending</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="form-group col-span-2">
          <label className="form-label">Additional Notes</label>
          <textarea className="form-textarea" placeholder="Any relevant context..." value={f.notes} onChange={up('notes')} />
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop:'1rem' }} onClick={() => onAnalyze(f)} disabled={loading||!f.studentName}>
        {loading ? <><div className="spinner"></div> Generating...</> : '📋 Generate Admin Report'}
      </button>
    </div>
  )
}
