import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// ─────────────────────────────────────────────────────────────
//  KNOWLEDGE BASE — rule-based responses
// ─────────────────────────────────────────────────────────────
const KB = [
  // ── Registrar ──────────────────────────────────────────────
  {
    keywords: ['summary of grades', 'grades', 'tor', 'transcript'],
    answer: "For Summary of Grades or TOR, go to the **Registrar's Office** at Building 1, Ground Floor.",
    location: { name: "Registrar's Office", query: "Registrar's Office" },
    windows: 'Proceed to Window 3 or Window 4.',
  },
  {
    keywords: ['prospectus', 'curriculum'],
    answer: 'A **Prospectus** is available at the **Registrar\'s Office**, Building 1, Ground Floor.',
    location: { name: "Registrar's Office", query: "Registrar's Office" },
    windows: 'Go to Window 1 or Window 2.',
  },
  {
    keywords: ['enrollment', 'enroll', 'enrolment'],
    answer: 'For **Enrollment**, visit the **Registrar\'s Office** at Building 1, Ground Floor.',
    location: { name: "Registrar's Office", query: "Registrar's Office" },
    windows: 'Proceed to Window 5 or 6.',
  },
  {
    keywords: ['certificate of enrollment', 'coe', 'cert of enrollment'],
    answer: 'Certificate of Enrollment is available at the **Registrar\'s Office**, Building 1, GF.',
    location: { name: "Registrar's Office", query: "Registrar's Office" },
    windows: 'Go to Window 7 or 8.',
  },
  {
    keywords: ['good moral', 'good moral certificate'],
    answer: 'Good Moral Certificate is released at the **Registrar\'s Office**, Building 1, GF.',
    location: { name: "Registrar's Office", query: "Registrar's Office" },
    windows: 'Proceed to Window 3.',
  },

  // ── Accounting / Cashier ───────────────────────────────────
  {
    keywords: ['tuition', 'fee', 'payment', 'pay', 'balance', 'cashier', 'accounting'],
    answer: 'For tuition fees and payments, go to the **Accounting Office** at Building 1, Ground Floor.',
    location: { name: 'Accounting Office', query: 'Accounting Office' },
    windows: 'Proceed to Window 1 or 2 of the Accounting Office.',
  },
  {
    keywords: ['scholarship', 'voucher', 'discount'],
    answer: 'For scholarship and voucher concerns, visit the **Accounting Office**, Building 1, GF.',
    location: { name: 'Accounting Office', query: 'Accounting Office' },
    windows: 'Proceed to Window 3 of the Accounting Office.',
  },

  // ── Guidance ───────────────────────────────────────────────
  {
    keywords: ['guidance', 'counselor', 'counseling', 'mental health', 'concern'],
    answer: 'The **Guidance Office** is at Building 1, Ground Floor. Our counselors are ready to help!',
    location: { name: 'Guidance Office', query: 'Guidance Office' },
    windows: null,
  },
  {
    keywords: ['nstp', 'national service'],
    answer: 'For NSTP concerns, visit the **NSTP Office** at Building 1, Ground Floor.',
    location: { name: 'NSTP Office', query: 'NSTP Office' },
    windows: null,
  },

  // ── Student Affairs ────────────────────────────────────────
  {
    keywords: ['student affairs', 'student id', 'id', 'organization', 'club', 'extracurricular'],
    answer: 'For student ID and org concerns, visit the **Student Affairs Office** at Building 1, GF.',
    location: { name: 'Student Affairs Office', query: 'Student Affairs' },
    windows: null,
  },
  {
    keywords: ['cdjp', 'discipline', 'violation'],
    answer: 'For discipline concerns, visit the **CDJP Office** at Building 1, Ground Floor.',
    location: { name: 'CDJP Office', query: 'CDJP Office' },
    windows: null,
  },

  // ── Admission ─────────────────────────────────────────────
  {
    keywords: ['admission', 'apply', 'application', 'new student', 'transferee'],
    answer: 'For admission and application, visit the **Admission Office** at Building 3, Ground Floor.',
    location: { name: 'Admission Office', query: 'Admission Office' },
    windows: null,
  },

  // ── Library ───────────────────────────────────────────────
  {
    keywords: ['library', 'book', 'reference', 'internet cafe', 'wifi', 'wi-fi'],
    answer: 'The **Library & Internet Cafe** is at Building 2, Ground Floor. Open during school hours!',
    location: { name: 'Library', query: 'Library' },
    windows: null,
  },

  // ── Clinic ────────────────────────────────────────────────
  {
    keywords: ['clinic', 'nurse', 'sick', 'medicine', 'first aid', 'health'],
    answer: 'The **ICCT Family Clinic** is at Building 3, Ground Floor. The school nurse is there!',
    location: { name: 'Clinic', query: 'Clinic' },
    windows: null,
  },

  // ── Drug Testing ──────────────────────────────────────────
  {
    keywords: ['drug test', 'drug testing'],
    answer: 'The **Drug Testing Center** is at Building 3, Ground Floor.',
    location: { name: 'Drug Testing Center', query: 'Drug Testing' },
    windows: null,
  },

  // ── Computer Labs ─────────────────────────────────────────
  {
    keywords: ['computer lab', 'computer laboratory', 'computer room', 'lab'],
    answer: 'Computer Laboratories are at **Building 2, 2nd Floor** — Rooms Ac1 to Ac6.',
    location: { name: 'Computer Lab', query: 'Computer Lab' },
    windows: null,
  },

  // ── Gymnasium ─────────────────────────────────────────────
  {
    keywords: ['gym', 'gymnasium', 'sports', 'basketball', 'pe'],
    answer: 'The **Gymnasium** is at Building 2, 6th Floor.',
    location: { name: 'Gymnasium', query: 'Gymnasium' },
    windows: null,
  },

  // ── Entrance / Exit ────────────────────────────────────────
  {
    keywords: ['entrance', 'enter', 'main gate', 'exit', 'go out'],
    answer: 'The main **Entrance/Exit** is at Building 3, Ground Floor near the security guard.',
    location: { name: 'Entrance', query: 'Entrance' },
    windows: null,
  },

  // ── General navigation ─────────────────────────────────────
  {
    keywords: ['where', 'find', 'locate', 'location', 'room', 'go to', 'how to get'],
    answer: 'I can help you find rooms! Try asking about a specific office or room, or use the **Home page search** to navigate directly on the map.',
    location: null,
    windows: null,
  },
]

// ── Quick reply suggestions ───────────────────────────────────
const QUICK_REPLIES = [
  { label: '📚 Summary of Grades',   msg: 'Where do I get Summary of Grades?' },
  { label: '📄 Prospectus',          msg: 'What window is for Prospectus?' },
  { label: '💰 Pay tuition fees',    msg: 'Where do I pay my tuition fees?' },
  { label: '🏥 Clinic',              msg: 'Where is the clinic?' },
  { label: '📖 Library',             msg: 'Where is the library?' },
  { label: '🎓 Guidance Office',     msg: 'Where is the Guidance Office?' },
  { label: '🆔 Student ID',          msg: 'Where do I get my student ID?' },
  { label: '🏫 Admission',           msg: 'Where is the Admission Office?' },
]

// ── Match query to knowledge base ────────────────────────────
function getResponse(input) {
  const q = input.toLowerCase()
  for (const item of KB) {
    if (item.keywords.some(k => q.includes(k))) {
      return item
    }
  }
  return null
}

// ── Format bold text (**text**) ───────────────────────────────
function formatText(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#6eb6ff' }}>{part}</strong>
      : part
  )
}

// ─────────────────────────────────────────────────────────────
//  CHATBOT COMPONENT
// ─────────────────────────────────────────────────────────────
export default function ChatBot() {
  const navigate   = useNavigate()
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hi! 👋 I'm your Campus Navigator Bot. How can I help you today?",
      time: new Date(),
    }
  ])
  const [input, setInput]     = useState('')
  const [typing, setTyping]   = useState(false)
  const [bounce, setBounce]   = useState(false)
  const messagesEndRef         = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Bounce animation every 5 seconds when closed
  useEffect(() => {
    if (open) return
    const interval = setInterval(() => {
      setBounce(true)
      setTimeout(() => setBounce(false), 600)
    }, 5000)
    return () => clearInterval(interval)
  }, [open])

  const sendMessage = (text) => {
    if (!text.trim()) return
    const userMsg = { from: 'user', text: text.trim(), time: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    // Simulate bot thinking delay
    setTimeout(() => {
      const match = getResponse(text)
      let botMsg

      if (match) {
        botMsg = {
          from: 'bot',
          text: match.answer,
          windows: match.windows,
          location: match.location,
          time: new Date(),
        }
      } else {
        botMsg = {
          from: 'bot',
          text: "I'm not sure about that. Try asking about a specific office, room, or service. Or use the **Home page search** to find any location on the map!",
          time: new Date(),
        }
      }

      setTyping(false)
      setMessages(prev => [...prev, botMsg])
    }, 800)
  }

  const handleViewOnMap = (query) => {
    setOpen(false)
    navigate(`/map?destination=${encodeURIComponent(query)}`)
  }

  const formatTime = (date) =>
    date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      {/* ── Chat panel ── */}
      {open && (
        <div style={s.panel}>
          {/* Header */}
          <div style={s.header}>
            <div style={s.headerLeft}>
              <div style={s.botAvatar}>🤖</div>
              <div>
                <p style={s.botName}>Campus Bot</p>
                <p style={s.botStatus}>● Online</p>
              </div>
            </div>
            <button style={s.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div style={s.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                ...s.msgRow,
                justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start'
              }}>
                {msg.from === 'bot' && <div style={s.botAvatarSmall}>🤖</div>}
                <div style={{
                  ...s.bubble,
                  ...(msg.from === 'user' ? s.bubbleUser : s.bubbleBot)
                }}>
                  <p style={s.bubbleText}>{formatText(msg.text)}</p>
                  {msg.windows && (
                    <p style={s.windowHint}>🪟 {msg.windows}</p>
                  )}
                  {msg.location && (
                    <button
                      style={s.mapBtn}
                      onClick={() => handleViewOnMap(msg.location.query)}
                    >
                      🗺️ View on Map →
                    </button>
                  )}
                  <p style={s.bubbleTime}>{formatTime(msg.time)}</p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ ...s.msgRow, justifyContent: 'flex-start' }}>
                <div style={s.botAvatarSmall}>🤖</div>
                <div style={{ ...s.bubble, ...s.bubbleBot }}>
                  <div style={s.typingDots}>
                    <span style={{ ...s.dot, animationDelay: '0ms' }}/>
                    <span style={{ ...s.dot, animationDelay: '150ms' }}/>
                    <span style={{ ...s.dot, animationDelay: '300ms' }}/>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {/* Quick replies */}
          <div style={s.quickReplies}>
            {QUICK_REPLIES.map((qr, i) => (
              <button key={i} style={s.quickBtn}
                onClick={() => sendMessage(qr.msg)}>
                {qr.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={s.inputRow}>
            <input
              style={s.input}
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            />
            <button style={s.sendBtn} onClick={() => sendMessage(input)}>
              ➤
            </button>
          </div>
        </div>
      )}

      {/* ── Floating bubble ── */}
      <button
        style={{
          ...s.fab,
          ...(bounce ? s.fabBounce : {}),
          ...(open ? s.fabOpen : {}),
        }}
        onClick={() => setOpen(p => !p)}
      >
        {open ? '✕' : '💬'}
        {!open && messages.length > 1 && (
          <div style={s.fabBadge}/>
        )}
      </button>

      {/* ── Typing animation keyframes ── */}
      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fabBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          30% { transform: translateY(-12px) scale(1.05); }
          60% { transform: translateY(-6px) scale(1.02); }
          80% { transform: translateY(-10px) scale(1.04); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  )
}

// ── Styles ────────────────────────────────────────────────────
const s = {
  // Floating button
  fab: {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    background: 'linear-gradient(135deg, #378add, #1d6fb5)',
    border: 'none',
    borderRadius: '50%',
    width: '62px',
    height: '62px',
    fontSize: '26px',
    cursor: 'pointer',
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(55,138,221,0.5)',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabBounce: {
    animation: 'fabBounce 0.6s ease',
  },
  fabOpen: {
    background: 'linear-gradient(135deg, #5a1a1a, #3a0f0f)',
    boxShadow: '0 4px 20px rgba(255,100,100,0.3)',
  },
  fabBadge: {
    position: 'absolute',
    top: '8px', right: '8px',
    width: '10px', height: '10px',
    background: '#f59e0b',
    borderRadius: '50%',
    border: '2px solid #0a1628',
  },

  // Chat panel
  panel: {
    position: 'fixed',
    bottom: '5.5rem',
    right: '1.5rem',
    width: '340px',
    height: '520px',
    background: '#0f2040',
    border: '1px solid #1e3a5f',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 999,
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    animation: 'slideUp 0.25s ease',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: '#0a1628',
    borderBottom: '1px solid #1e3a5f',
    flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  botAvatar: {
    width: '36px', height: '36px',
    background: 'linear-gradient(135deg, #378add, #1d6fb5)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px',
  },
  botName:   { fontSize: '14px', fontWeight: '700', color: 'white', margin: 0 },
  botStatus: { fontSize: '11px', color: '#1d9e75', margin: 0 },
  closeBtn: {
    background: 'transparent', border: 'none',
    color: '#4a7fb5', fontSize: '16px', cursor: 'pointer',
    padding: '4px 8px',
  },

  // Messages area
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  msgRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '6px',
  },
  botAvatarSmall: {
    width: '26px', height: '26px',
    background: 'linear-gradient(135deg, #378add, #1d6fb5)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', flexShrink: 0,
  },
  bubble: {
    maxWidth: '75%',
    padding: '10px 12px',
    borderRadius: '16px',
    wordBreak: 'break-word',
  },
  bubbleBot: {
    background: '#162d55',
    border: '1px solid #1e3a5f',
    borderBottomLeftRadius: '4px',
  },
  bubbleUser: {
    background: 'linear-gradient(135deg, #378add, #1d6fb5)',
    borderBottomRightRadius: '4px',
  },
  bubbleText: { fontSize: '13px', color: 'white', margin: 0, lineHeight: 1.5 },
  bubbleTime: { fontSize: '10px', color: '#4a7fb5', margin: '4px 0 0', textAlign: 'right' },
  windowHint: {
    fontSize: '11px', color: '#f59e0b',
    margin: '6px 0 0', padding: '4px 8px',
    background: '#1a1200', borderRadius: '6px',
    border: '1px solid #3a2800',
  },
  mapBtn: {
    marginTop: '8px',
    width: '100%',
    background: '#378add',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
    padding: '7px 12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  // Typing dots
  typingDots: { display: 'flex', gap: '4px', padding: '2px 0' },
  dot: {
    width: '7px', height: '7px',
    background: '#4a7fb5',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'dotBounce 1s infinite',
  },

  // Quick replies
  quickReplies: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    padding: '8px 12px',
    borderTop: '1px solid #1e3a5f',
    flexShrink: 0,
    maxHeight: '90px',
    overflowY: 'auto',
  },
  quickBtn: {
    background: '#0a1628',
    border: '1px solid #1e3a5f',
    borderRadius: '20px',
    color: '#6eb6ff',
    fontSize: '11px',
    padding: '5px 10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },

  // Input
  inputRow: {
    display: 'flex',
    gap: '8px',
    padding: '10px 12px',
    borderTop: '1px solid #1e3a5f',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: '#0a1628',
    border: '1px solid #1e3a5f',
    borderRadius: '20px',
    color: 'white',
    fontSize: '13px',
    padding: '8px 14px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  sendBtn: {
    background: '#378add',
    border: 'none',
    borderRadius: '50%',
    color: 'white',
    fontSize: '16px',
    width: '36px',
    height: '36px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
}
