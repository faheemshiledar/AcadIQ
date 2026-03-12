'use client'
import { useState, useRef, useEffect } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string; ts: string }

const SUGGESTIONS = [
  'How do I prepare for campus placements?',
  'What DSA topics should I focus on for interviews?',
  'How to improve my CGPA in final year?',
  'Which skills are in demand for web dev jobs in India?',
  'How to write a good resume for fresher jobs?',
  'What is the difference between service and product companies?',
]

function formatMsg(text: string) {
  // Simple markdown: code blocks, inline code, bold, bullet lists
  const lines = text.split('\n')
  const result: any[] = []
  let inCode = false, codeLang = '', codeLines: string[] = []

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true
        codeLang = line.slice(3).trim()
        codeLines = []
      } else {
        result.push(
          <pre key={i}>
            <code>{codeLines.join('\n')}</code>
          </pre>
        )
        inCode = false; codeLines = []
      }
      return
    }
    if (inCode) { codeLines.push(line); return }

    const parsed = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^#{1,3}\s(.+)/, '<strong style="font-size:1rem">$1</strong>')

    if (/^(\*|-)\s/.test(line)) {
      result.push(<li key={i} style={{ marginLeft:'1rem', marginBottom:'.2rem', fontSize:'.9rem' }} dangerouslySetInnerHTML={{ __html: parsed.replace(/^(\*|-)\s/, '') }}/>)
    } else if (parsed.trim()) {
      result.push(<p key={i} style={{ marginBottom:'.4rem', fontSize:'.9rem', lineHeight:1.65 }} dangerouslySetInnerHTML={{ __html: parsed }}/>)
    } else {
      result.push(<br key={i}/>)
    }
  })
  return result
}

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: "Hi! I'm your AcadIQ AI assistant. I can help you with:\n\n- **Academic doubts** — concepts, exam prep, study strategies\n- **Career & placement** — DSA, interviews, resume, job market\n- **Campus life** — clubs, backlogs, attendance, faculty\n\nWhat would you like to know?", ts: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  const send = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')

    const ts = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
    const newMsgs: Msg[] = [...msgs, { role:'user', content:msg, ts }]
    setMsgs(newMsgs)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ messages: newMsgs.map(m => ({ role:m.role, content:m.content })) })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setMsgs(p => [...p, { role:'assistant', content:json.message, ts: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }])
    } catch (e: any) {
      setMsgs(p => [...p, { role:'assistant', content:`Sorry, something went wrong: ${e.message}`, ts:'' }])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="chat-layout" style={{ flex:1 }}>
      {/* Header */}
      <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:.75+'rem', background:'var(--bg)' }}>
        <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem' }}>🤖</div>
        <div>
          <div style={{ fontWeight:700, fontSize:'.95rem' }}>AcadIQ Assistant</div>
          <div style={{ fontSize:'.72rem', color:'var(--green)', display:'flex', alignItems:'center', gap:'.35rem' }}>
            <span style={{ width:6,height:6,borderRadius:'50%',background:'var(--green)',display:'inline-block' }}/>
            Online · Academic, Career & Campus
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft:'auto' }} onClick={() => setMsgs([])}>Clear chat</button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {msgs.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>
            <div className={`bubble-content ${m.role}`}>
              {m.role === 'user' ? m.content : formatMsg(m.content)}
            </div>
            {m.ts && <div className="bubble-meta">{m.ts}</div>}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant">
            <div className="bubble-content assistant" style={{ display:'flex', alignItems:'center', gap:'.5rem', color:'var(--text3)' }}>
              <div className="spinner" style={{ borderTopColor:'var(--accent)' }}/>
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Suggestions */}
      {msgs.length <= 1 && (
        <div style={{ padding:'.5rem 1.5rem' }}>
          <div className="chat-suggestions">
            {SUGGESTIONS.map((s,i) => (
              <button key={i} className="chat-suggest-btn" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="chat-input-area">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          placeholder="Ask anything about academics, career, or campus life... (Enter to send, Shift+Enter for new line)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          rows={1}
          style={{ height:'auto' }}
          onInput={e => {
            const t = e.target as HTMLTextAreaElement
            t.style.height = 'auto'
            t.style.height = Math.min(t.scrollHeight, 120) + 'px'
          }}
        />
        <button className="chat-send" onClick={() => send()} disabled={loading || !input.trim()}>
          {loading ? <div className="spinner" style={{ borderTopColor:'white' }}/> : '↑'}
        </button>
      </div>
    </div>
  )
}
