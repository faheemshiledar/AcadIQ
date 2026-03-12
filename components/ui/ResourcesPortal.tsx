'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

type Resource = {
  id: string; created_at: string; title: string; category: string;
  description: string; file_url: string; external_link: string;
  semester: string; subject: string; file_name: string; file_size: number;
}

const CATEGORIES = [
  { id:'all',       label:'All',        icon:'📦' },
  { id:'syllabus',  label:'Syllabus',   icon:'📋' },
  { id:'pyq',       label:'PYQs',       icon:'📝' },
  { id:'notes',     label:'Notes',      icon:'📓' },
  { id:'timetable', label:'Timetable',  icon:'🗓️' },
  { id:'brochure',  label:'Brochure',   icon:'📄' },
  { id:'event',     label:'Events',     icon:'🎉' },
  { id:'other',     label:'Other',      icon:'📌' },
]

const CAT_COLORS: Record<string,string> = {
  syllabus:'var(--blue)', pyq:'var(--yellow)', notes:'var(--green)',
  timetable:'var(--accent2)', brochure:'var(--text2)', event:'var(--red)', other:'var(--text3)'
}

const FILE_ICONS: Record<string, string> = {
  pdf:'📕', doc:'📘', docx:'📘', ppt:'📙', pptx:'📙',
  xls:'📗', xlsx:'📗', txt:'📄', jpg:'🖼', png:'🖼',
}

function getFileExt(name: string) {
  return name?.split('.').pop()?.toLowerCase() || ''
}

function FileSize({ bytes }: { bytes: number }) {
  if (!bytes) return null
  const kb = bytes / 1024
  return <span>{kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb/1024).toFixed(1)} MB`}</span>
}

const EMPTY_FORM = { title:'', category:'syllabus', description:'', external_link:'', semester:'', subject:'' }

export default function ResourcesPortal({ role }: { role: string }) {
  const [resources, setResources]   = useState<Resource[]>([])
  const [loading, setLoading]       = useState(true)
  const [category, setCategory]     = useState('all')
  const [search, setSearch]         = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [error, setError]           = useState('')
  const [form, setForm]             = useState(EMPTY_FORM)
  const [uploadMode, setUploadMode] = useState<'link'|'file'>('link')
  const [selectedFile, setSelectedFile] = useState<File|null>(null)
  const [uploading, setUploading]   = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [deleting, setDeleting]     = useState<string|null>(null)
  const [toast, setToast]           = useState('')
  const [dragOver, setDragOver]     = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const up = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }))
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3200) }

  const fetch_ = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const p = new URLSearchParams()
      if (category !== 'all') p.set('category', category)
      if (search) p.set('search', search)
      const res = await fetch(`/api/resources?${p}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setResources(json.resources || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [category, search])

  useEffect(() => { fetch_() }, [fetch_])

  const handleFileSelect = (f: File) => {
    setSelectedFile(f)
    if (!form.title) setForm(p => ({ ...p, title: f.name.replace(/\.[^/.]+$/, '') }))
  }

  const submitResource = async () => {
    if (!form.title || !form.category) return
    if (uploadMode === 'link' && !form.external_link) return
    if (uploadMode === 'file' && !selectedFile) return

    setUploading(true); setUploadProgress('')

    try {
      let file_url = ''
      let file_name = ''
      let file_size = 0

      if (uploadMode === 'file' && selectedFile) {
        setUploadProgress('Uploading file...')
        const fd = new FormData()
        fd.append('file', selectedFile)
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
        const upJson = await upRes.json()
        if (!upRes.ok) throw new Error(upJson.error || 'File upload failed')
        file_url  = upJson.url
        file_name = upJson.file_name
        file_size = upJson.file_size
        setUploadProgress('Saving resource...')
      }

      const payload: any = {
        ...form,
        file_url,
        file_name,
        file_size,
        uploaded_by: 'admin',
      }
      if (uploadMode === 'link') {
        payload.file_url = ''
      } else {
        payload.external_link = ''
      }

      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      showToast('✓ Resource added successfully!')
      setForm(EMPTY_FORM)
      setSelectedFile(null)
      setShowUpload(false)
      setUploadProgress('')
      fetch_()
    } catch (e: any) {
      showToast('⚠ ' + e.message)
      setUploadProgress('')
    } finally {
      setUploading(false)
    }
  }

  const deleteResource = async (id: string) => {
    if (!confirm('Delete this resource?')) return
    setDeleting(id)
    try {
      await fetch('/api/resources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setResources(p => p.filter(r => r.id !== id))
      showToast('Deleted.')
    } catch {}
    setDeleting(null)
  }

  const getCatInfo = (id: string) => CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
  const canSubmit = form.title && form.category && (uploadMode === 'link' ? !!form.external_link : !!selectedFile)

  return (
    <div>
      <div className="page-header">
        <div className="page-badge badge-resources">📂 Resources</div>
        <h1 className="page-title">Resource Library</h1>
        <p className="page-desc">
          {role === 'admin'
            ? 'Upload files directly or add links — manage all study resources for students'
            : 'Access syllabus, PYQs, notes, timetables, brochures & event details'}
        </p>
      </div>

      {/* Category filters */}
      <div className="cat-filter">
        {CATEGORIES.map(c => (
          <button key={c.id} className={`cat-btn ${category === c.id ? 'active' : ''}`} onClick={() => setCategory(c.id)}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Search + upload toggle */}
      <div style={{ display:'flex', gap:'.75rem', marginBottom:'1.5rem', alignItems:'center' }}>
        <div className="search-wrap" style={{ flex:1, marginBottom:0 }}>
          <span className="search-icon">🔍</span>
          <input className="form-input" placeholder="Search resources..." value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetch_()} />
        </div>
        {role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowUpload(p => !p)}>
            {showUpload ? '✕ Close' : '+ Add Resource'}
          </button>
        )}
      </div>

      {/* ── Upload / Add form ── */}
      {showUpload && role === 'admin' && (
        <div className="card" style={{ marginBottom:'1.5rem', borderColor:'var(--accent)' }}>
          <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:'1.25rem' }}>➕ Add New Resource</div>

          {/* Mode toggle */}
          <div style={{ display:'flex', gap:'.5rem', marginBottom:'1.25rem', padding:'.25rem', background:'var(--bg3)', borderRadius:10, width:'fit-content' }}>
            {(['link','file'] as const).map(mode => (
              <button key={mode} onClick={() => { setUploadMode(mode); setSelectedFile(null) }}
                style={{
                  padding:'.45rem 1.1rem', borderRadius:8, border:'none', cursor:'pointer',
                  fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'.82rem', fontWeight:700, transition:'all .15s',
                  background: uploadMode === mode ? 'var(--accent)' : 'transparent',
                  color: uploadMode === mode ? '#fff' : 'var(--text2)',
                }}>
                {mode === 'link' ? '🔗 Link (URL)' : '📁 Upload File'}
              </button>
            ))}
          </div>

          <div className="form-grid">
            <div className="form-group col-span-2">
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="e.g. DBMS Unit 1–3 Notes, 5th Sem Timetable"
                value={form.title} onChange={up('title')} />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" value={form.category} onChange={up('category')}>
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Semester</label>
              <select className="form-select" value={form.semester} onChange={up('semester')}>
                <option value="">All / Not specified</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input className="form-input" placeholder="e.g. DBMS, OS, Mathematics" value={form.subject} onChange={up('subject')} />
            </div>

            {/* Link mode */}
            {uploadMode === 'link' && (
              <div className="form-group">
                <label className="form-label">Link (Google Drive, any URL) *</label>
                <input className="form-input" type="url" placeholder="https://drive.google.com/..."
                  value={form.external_link} onChange={up('external_link')} />
              </div>
            )}

            {/* File upload mode */}
            {uploadMode === 'file' && (
              <div className="form-group col-span-2">
                <label className="form-label">File * (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, JPG, PNG — max 50 MB)</label>
                <input ref={fileRef} type="file"
                  accept=".pdf,.txt,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                  style={{ display:'none' }}
                  onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && handleFileSelect(e.dataTransfer.files[0]) }}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--accent)' : selectedFile ? 'var(--green)' : 'var(--border2)'}`,
                    borderRadius: 'var(--radius2)', padding:'1.5rem', textAlign:'center', cursor:'pointer',
                    background: dragOver ? 'rgba(91,106,240,.06)' : selectedFile ? 'var(--green2)' : 'var(--bg2)',
                    transition:'all .18s',
                  }}>
                  {selectedFile ? (
                    <div>
                      <div style={{ fontSize:'1.5rem', marginBottom:'.35rem' }}>
                        {FILE_ICONS[getFileExt(selectedFile.name)] || '📄'}
                      </div>
                      <div style={{ fontWeight:700, fontSize:'.9rem', marginBottom:'.2rem' }}>{selectedFile.name}</div>
                      <div style={{ fontSize:'.75rem', color:'var(--text3)' }}>
                        {(selectedFile.size / 1024).toFixed(0)} KB · Click to change
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize:'1.75rem', marginBottom:'.5rem' }}>📁</div>
                      <div style={{ fontWeight:600, fontSize:'.875rem', marginBottom:'.3rem' }}>Drop file here or click to browse</div>
                      <div style={{ fontSize:'.75rem', color:'var(--text3)' }}>PDF · DOC · PPT · XLS · TXT · Images</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="form-group col-span-2">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Brief description of what this resource contains..."
                value={form.description} onChange={up('description')} />
            </div>
          </div>

          {uploadMode === 'file' && (
            <div className="info-box info-box-blue" style={{ marginTop:'.875rem', marginBottom:'.875rem', fontSize:'.8rem' }}>
              📦 Files are uploaded to Supabase Storage. Make sure the <strong>resources</strong> bucket exists in your Supabase project with public access enabled.
            </div>
          )}
          {uploadMode === 'link' && (
            <div className="info-box info-box-blue" style={{ marginTop:'.875rem', marginBottom:'.875rem', fontSize:'.8rem' }}>
              💡 Upload your file to Google Drive or Dropbox and paste the shareable link. Make sure "Anyone with the link" access is enabled.
            </div>
          )}

          {uploadProgress && (
            <div style={{ display:'flex', alignItems:'center', gap:'.6rem', padding:'.6rem .75rem', background:'var(--bg3)', borderRadius:8, marginBottom:'.875rem', fontSize:'.82rem', color:'var(--accent)' }}>
              <div className="spinner" style={{ borderTopColor:'var(--accent)', width:14, height:14 }}/>
              {uploadProgress}
            </div>
          )}

          <div style={{ display:'flex', gap:'.75rem' }}>
            <button className="btn btn-primary" onClick={submitResource} disabled={uploading || !canSubmit}>
              {uploading
                ? <><div className="spinner" style={{ borderTopColor:'#fff', width:14, height:14 }}/> {uploadProgress || 'Saving...'}</>
                : uploadMode === 'file' ? '⬆ Upload & Add' : '✓ Add Resource'
              }
            </button>
            <button className="btn btn-ghost" onClick={() => { setShowUpload(false); setSelectedFile(null); setForm(EMPTY_FORM) }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="info-box" style={{ background:'var(--red2)', color:'var(--red)', border:'1px solid rgba(240,91,91,.2)', marginBottom:'1rem' }}>
          ⚠ {error}
        </div>
      )}

      {loading ? (
        <div className="state-box">
          <div className="spinner spinner-lg" style={{ borderTopColor:'var(--accent)' }}/>
          <p className="state-text">Loading resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="state-box">
          <div className="state-icon">📂</div>
          <p className="state-text">
            {role === 'admin'
              ? 'No resources yet. Click "+ Add Resource" to add the first one.'
              : 'No resources available in this category yet.'}
          </p>
        </div>
      ) : (
        <div className="resource-grid">
          {resources.map(r => {
            const cat = getCatInfo(r.category)
            const color = CAT_COLORS[r.category] || 'var(--text2)'
            const ext = getFileExt(r.file_name || '')
            const isFile = !!r.file_url
            const openUrl = r.external_link || r.file_url

            return (
              <div key={r.id} className="resource-card">
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'.5rem' }}>
                  <div className="resource-icon">{isFile && ext ? (FILE_ICONS[ext] || cat.icon) : cat.icon}</div>
                  <div style={{ display:'flex', gap:'.35rem', flexWrap:'wrap', justifyContent:'flex-end' }}>
                    <span className="tag" style={{ background:color+'22', color, flexShrink:0 }}>{cat.label}</span>
                    {isFile && <span className="tag tag-blue" style={{ fontSize:'.65rem' }}>📁 {ext?.toUpperCase()}</span>}
                  </div>
                </div>
                <div className="resource-title">{r.title}</div>
                {r.description && (
                  <div style={{ fontSize:'.8rem', color:'var(--text2)', marginTop:'.35rem', lineHeight:1.5 }}>{r.description}</div>
                )}
                <div className="resource-meta" style={{ marginTop:'.5rem' }}>
                  {r.semester && <span>Sem {r.semester}</span>}
                  {r.subject && <span>{r.subject}</span>}
                  {r.file_size ? <FileSize bytes={r.file_size}/> : null}
                  <span>{new Date(r.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
                </div>
                <div className="resource-actions">
                  {openUrl && (
                    <a href={openUrl} target="_blank" rel="noopener noreferrer"
                      className="btn btn-primary btn-sm" style={{ textDecoration:'none' }}>
                      {isFile ? '⬇ Download' : '↗ Open'}
                    </a>
                  )}
                  {role === 'admin' && (
                    <button className="btn btn-danger btn-sm" onClick={() => deleteResource(r.id)} disabled={deleting === r.id}>
                      {deleting === r.id ? <div className="spinner"/> : '✕ Delete'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  )
}
