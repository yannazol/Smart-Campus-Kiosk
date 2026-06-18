import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// ─────────────────────────────────────────────────────────────
//  KNOWLEDGE BASE
// ─────────────────────────────────────────────────────────────
const KB = [
  { keywords: ['summary of grades', 'grades', 'sog', 'tor', 'transcript'],
    answer: "For **Summary of Grades** or TOR, go to the Registrar's Office at Building 1, Ground Floor.",
    location: { name: "Registrar's Office", query: "Window 3" }, 
    windows: 'Proceed to Window 1 or Window 3.' },

  { keywords: ['prospectus', 'curriculum'],
    answer: "A **Prospectus** is available at the Registrar's Office, Building 1, Ground Floor.",
    location: { name: "Registrar's Office", query: "Registrar's Office" }, 
    windows: 'Go to Window 1 or Window 2.' },

  { keywords: ['enrollment', 'enroll', 'enrolment'],
    answer: "For **Enrollment**, visit the Registrar's Office at Building 1, Ground Floor.",
    location: { name: "Registrar's Office", query: "Registrar's Office" },
    windows: 'Proceed to Window 5 or 6.' },

  { keywords: ['certificate of enrollment', 'coe'],
    answer: "**Certificate of Enrollment** is available at the Registrar's Office, Building 1, GF.",
    location: { name: "Registrar's Office", query: "Registrar's Office" }, 
    windows: 'Go to Window 7 or 8.' },

  { keywords: ['good moral'],
    answer: "**Good Moral Certificate** is released at the Registrar's Office, Building 1, GF.",
    location: { name: "Registrar's Office", query: "Registrar's Office" }, 
    windows: 'Proceed to Window 3.' },

  { keywords: ['tuition', 'fee', 'payment', 'pay', 'balance', 'cashier', 'accounting'],
    answer: 'For tuition fees and payments, go to the **Accounting Office** at Building 1, Ground Floor.',
    location: { name: 'Accounting Office', query: 'Accounting Office' }, 
    windows: 'Proceed to Window 1 or 2.' },

  { keywords: ['scholarship', 'voucher', 'discount'],
    answer: 'For scholarship and voucher concerns, visit the **Accounting Office**, Building 1, GF.',
    location: { name: 'Accounting Office', query: 'Accounting Office' }, 
    windows: 'Proceed to Window 3.' },

  { keywords: ['guidance', 'counselor', 'counseling', 'mental health'],
    answer: 'The **Guidance Office** is at Building 1, Ground Floor. Our counselors are ready to help!',
    location: { name: 'Guidance Office', query: 'Guidance Office' }, 
    windows: null },

  { keywords: ['nstp', 'national service'],
    answer: 'For NSTP concerns, visit the **NSTP Office** at Building 1, Ground Floor.',
    location: { name: 'NSTP Office', query: 'NSTP Office' }, 
    windows: null },

  { keywords: ['student affairs', 'student id', 'id', 'organization', 'club'],
    answer: 'For student ID and org concerns, visit the **Student Affairs Office** at Building 1, GF.',
    location: { name: 'Student Affairs Office', query: 'Student Affairs' },
     windows: null },

  { keywords: ['cdjp', 'discipline', 'violation'],
    answer: 'For discipline concerns, visit the **CDJP Office** at Building 1, Ground Floor.',
    location: { name: 'CDJP Office', query: 'CDJP Office' }, 
    windows: null },

  { keywords: ['admission', 'apply', 'application', 'new student', 'transferee'],
    answer: 'For admission and application, visit the **Admission Office** at Building 3, Ground Floor.',
    location: { name: 'Admission Office', query: 'Admission Office' }, 
    windows: null },

  { keywords: ['library', 'book', 'reference', 'internet cafe', 'wifi'],
    answer: 'The **Library & Internet Cafe** is at Building 2, Ground Floor. Open during school hours!',
    location: { name: 'Library', query: 'Library' }, 
    windows: null },

  { keywords: ['clinic', 'nurse', 'sick', 'medicine', 'first aid', 'health'],
    answer: 'The **ICCT Family Clinic** is at Building 3, Ground Floor. The school nurse is there!',
    location: { name: 'Clinic', query: 'Clinic' }, 
    windows: null },

  { keywords: ['drug test', 'drug testing'],
    answer: 'The **Drug Testing Center** is at Building 3, Ground Floor.',
    location: { name: 'Drug Testing Center', query: 'Drug Testing' }, 
    windows: null },

  { keywords: ['computer lab', 'computer laboratory', 'computer room'],
    answer: 'Computer Laboratories are at **Building 2, 2nd Floor** — Rooms Ac1 to Ac6.',
    location: { name: 'Computer Lab', query: 'Computer Lab' }, 
    windows: null },

  { keywords: ['gym', 'gymnasium', 'sports', 'basketball', 'pe'],
    answer: 'The **Gymnasium** is at Building 2, 6th Floor.',
    location: { name: 'Gymnasium', query: 'Gymnasium' }, 
    windows: null },

  { keywords: ['entrance', 'enter', 'main gate', 'exit', 'go out'],
    answer: 'The main **Entrance/Exit** is at Building 3, Ground Floor near the security guard.',
    location: { name: 'Entrance', query: 'Entrance' }, 
    windows: null },

]

const QUICK_REPLIES = [
  { label: '📚 Summary of Grades', msg: 'Where do I get Summary of Grades?' },
  { label: '📄 Prospectus',        msg: 'What window is for Prospectus?' },
  { label: '💰 Pay tuition fees',  msg: 'Where do I pay my tuition fees?' },
  { label: '🏥 Clinic',            msg: 'Where is the clinic?' },
  { label: '📖 Library',           msg: 'Where is the library?' },
  { label: '🎓 Guidance Office',   msg: 'Where is the Guidance Office?' },
  { label: '🆔 Student ID',        msg: 'Where do I get my student ID?' },
  { label: '🏫 Admission',         msg: 'Where is the Admission Office?' },
]

// Keyboard rows with period and dash


const INITIAL_MSG = [{ from: 'bot', text: "Hi! 👋 I'm your Campus Navigator Bot. How can I help you today?", time: new Date().toISOString() }]

function getResponse(input) {
  const q = input.toLowerCase()
  for (const item of KB) {
    if (item.keywords.some(k => q.includes(k))) return item
  }
  return null
}

function formatText(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} style={{ color: '#6eb6ff' }}>{part}</strong> : part
  )
}

// ─────────────────────────────────────────────────────────────
//  CHATBOT COMPONENT
// ─────────────────────────────────────────────────────────────
export default function ChatBot() {
  const navigate = useNavigate()

  // sessionStorage remember messages across open/close and page refresh-------------------------------
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('chatbot_messages')
      if (saved) return JSON.parse(saved).map(m => ({ ...m, time: new Date(m.time) }))
    } catch {}
    return INITIAL_MSG.map(m => ({ ...m, time: new Date(m.time) }))
  })

  const [open,        setOpen]        = useState(false)
  const [input,       setInput]       = useState('')
  const [typing,      setTyping]      = useState(false)
  const [capsOn,      setCapsOn]      = useState(true)
  const [showKeyboard,setShowKeyboard]= useState(false)
  const messagesEndRef = useRef(null)
  const overlayRef     = useRef(null)
  const idleTimer      = useRef(null)

  // Save messages to sessionStorage kapag nagbago, para hindi mawala on refresh o close-open ng panel
  useEffect(() => {
    sessionStorage.setItem('chatbot_messages', JSON.stringify(messages))
  }, [messages])


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const handleKey = (key) => {
    if (key === '⌫') { setInput(prev => prev.slice(0, -1)); return }
    if (key === '-' || key === '.') { setInput(prev => prev + key); return }
    const char = capsOn ? key.toUpperCase() : key.toLowerCase()
    setInput(prev => prev + char)
  }

  const handleSpace = () => setInput(prev => prev + ' ')

  const sendMessage = (text) => {
    if (!text.trim()) return
    const userMsg = { from: 'user', text: text.trim(), time: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)
    setShowKeyboard(false)
    

    setTimeout(() => {
      const match = getResponse(text)
      const botMsg = match
        ? { from: 'bot', text: match.answer, windows: match.windows, location: match.location, time: new Date() }
        : { from: 'bot', text: "I'm not sure about that. Try asking about a specific office or room, or use the **Home page search** to find any location!", time: new Date() }
      setTyping(false)
      setMessages(prev => [...prev, botMsg])
    }, 800)
  }

  const handleViewOnMap = (query) => {
    setOpen(false)
    navigate(`/map?destination=${encodeURIComponent(query)}`)
  }

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      setOpen(false)
      setShowKeyboard(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes dotBounce {
          0%,80%,100% { transform:translateY(0);opacity:0.4; }
          40% { transform:translateY(-5px);opacity:1; }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(30px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes fabPulse {
          0%,100% { box-shadow:0 4px 20px rgba(55,138,221,0.5); }
          50%     { box-shadow:0 4px 32px rgba(55,138,221,0.9); }
        }
        @keyframes fabPulseOpen {
          0%,100% { box-shadow:0 4px 20px rgba(55,138,221,0.8); }
          50%     { box-shadow:0 4px 36px rgba(55,138,221,1); }
        }
        @keyframes blink {
          0%,100% { opacity:1; }
          50%     { opacity:0; }
        }
        .chatbot-messages::-webkit-scrollbar { width:4px; }
        .chatbot-messages::-webkit-scrollbar-track { background:transparent; }
        .chatbot-messages::-webkit-scrollbar-thumb { background:#1e3a5f; border-radius:4px; }
      `}</style>

      {/* Overlay */}
      {open && <div ref={overlayRef} onClick={handleOverlayClick} style={s.overlay}/>}

      {/* Chat panel ----------------------------- */}
      {open && (
        <div style={s.panel}>

          {/* header ----------------------------- */}
          <div style={s.header}>
            <div style={s.headerLeft}>
              <div style={s.botAvatar}>:)</div>
              <div>
                <p style={s.botName}>Campus BotBot</p>
                <p style={s.botStatus}>● Online</p>
              </div>
            </div>
          </div>

          {/* Messages ----------------------------- */}
          <div className="chatbot-messages" style={s.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={{ ...s.msgRow, justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.from === 'bot' && <div style={s.botAvatarSmall}>:)</div>}
                <div style={{ ...s.bubble, ...(msg.from === 'user' ? s.bubbleUser : s.bubbleBot) }}>
                  <p style={s.bubbleText}>{formatText(msg.text)}</p>
                  {msg.windows && <p style={s.windowHint}>🪟 {msg.windows}</p>}
                  {msg.location && (
                    <button style={s.mapBtn} onClick={() => handleViewOnMap(msg.location.query)}>
                      🗺️ View on Map →
                    </button>
                  )}
                  <p style={s.bubbleTime}>{formatTime(msg.time)}</p>
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ ...s.msgRow, justifyContent: 'flex-start' }}>
                <div style={s.botAvatarSmall}>:)</div>
                <div style={{ ...s.bubble, ...s.bubbleBot }}>
                  <div style={s.typingDots}>
                    {[0,150,300].map((d,i) => <span key={i} style={{ ...s.dot, animationDelay:`${d}ms` }}/>)}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {/*  Quick replies ALWAYS visible */}
          <div style={s.quickReplies}>
            {QUICK_REPLIES.map((qr, i) => (
              <button key={i} style={s.quickBtn}
                onMouseDown={e => { e.preventDefault(); sendMessage(qr.msg) }}>
                {qr.label}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div style={s.inputRow}>
            <div style={{ ...s.inputDisplay, ...(showKeyboard ? s.inputDisplayActive : {}) }}
              onClick={() => setShowKeyboard(true)}>
              <span style={{ color: input ? 'white' : '#4a7fb5', fontSize: '15px', flex: 1 }}>
                {showKeyboard ? input : (input || 'Tap to type a message...')}
                {showKeyboard && <span style={s.cursor}>|</span>}
              </span>
              {input.length > 0 && (
                <button style={s.clearInput}
                  onMouseDown={e => { e.preventDefault(); setInput('') }}>✕</button>
              )}
            </div>
            <button
              style={{ ...s.sendBtn, ...(input.trim() ? {} : s.sendBtnDisabled) }}
              onMouseDown={e => { e.preventDefault(); if (input.trim()) sendMessage(input) }}>
              ➤
            </button>
          </div>

          {/* Keyboard inside panel — no resize */}
          {showKeyboard && (
            <div style={s.keyboard}>
              {/*  bigger keys + period + dash in last row */}
              {KEYBOARD_ROWS.map((row, i) => (
                <div key={i} style={s.keyRow}>
                  {row.map(key => (
                    <button key={key}
                      style={{ ...s.key, ...(key === '⌫' ? s.keyBackspace : {}), ...(key === '-' || key === '.' ? s.keySymbol : {}) }}
                      onMouseDown={e => { e.preventDefault(); handleKey(key) }}>
                      {key === '⌫' ? '⌫' : (key === '-' || key === '.') ? key : capsOn ? key : key.toLowerCase()}
                    </button>
                  ))}
                </div>
              ))}
              <div style={s.keyRow}>
                <button style={{ ...s.key, ...s.keyCaps, ...(capsOn ? s.keyCapsOn : {}) }}
                  onMouseDown={e => { e.preventDefault(); setCapsOn(p => !p) }}>⬆</button>
                <button style={{ ...s.key, ...s.keySpace }}
                  onMouseDown={e => { e.preventDefault(); handleSpace() }}>SPACE</button>
                <button style={{ ...s.key, ...s.keySymbol }}
                  onMouseDown={e => { e.preventDefault(); handleKey('-') }}>-</button>
                <button style={{ ...s.key, ...s.keySymbol }}
                  onMouseDown={e => { e.preventDefault(); handleKey('.') }}>.</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating bubble */}
      <button
        style={{ ...s.fab, animation: open ? 'fabPulseOpen 2s infinite' : 'fabPulse 3s infinite' }}
        onClick={() => { setOpen(p => !p); setShowKeyboard(false) }}>
        💬
        {!open && messages.length > 1 && <div style={s.fabBadge}/>}
      </button>
    </>
  )
}

// ── Styles ────────────────────────────────────────────────────
const s = {
  overlay: { position:'fixed', inset:0, zIndex:998, background:'transparent' },

  fab: {
    position:'fixed', bottom:'6rem', right:'6rem',
    background:'linear-gradient(135deg, #378add, #1d6fb5)',
    border:'none', borderRadius:'50%',
    width:'80px', height:'72px', fontSize:'30px',
    cursor:'pointer', zIndex:1000,
    transition:'transform 0.2s',
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  fabBadge: {
    position:'absolute', top:'5px', right:'10px',
    width:'12px', height:'12px',
    background:'#cdb07f', borderRadius:'50%',
    border:'2px solid #0a1628',
  },

  // floats above FAB with gap -----------------------
  panel: {
    position:'fixed',
    bottom:'10rem',           
    right:'11rem',
    width:'600px',
    height:'800px',          
    background:'#0f2040',
    border:'1px solid #1e3a5f',
    borderRadius:'20px',
    display:'flex', flexDirection:'column',
    zIndex:999,
    boxShadow:'0 8px 40px rgba(0,0,0,0.6)',
    overflow:'hidden',
    animation:'slideUp 0.25s ease',
    fontFamily:"'Segoe UI', system-ui, sans-serif",
  },

  header: {
    display:'flex', alignItems:'center',
    padding:'14px 18px',           
    background:'#0a1628',
    borderBottom:'1px solid #1e3a5f',
    flexShrink:0,
  },

  headerLeft: { display:'flex', alignItems:'center', gap:'12px' },
  botAvatar: {
    width:'40px', height:'40px',
    background:'linear-gradient(135deg, #378add, #1d6fb5)',
    borderRadius:'50%',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'20px', flexShrink:0,
  },

  botName:   { fontSize:'16px', fontWeight:'700', color:'white', margin:0 },
  botStatus: { fontSize:'12px', color:'#1d9e75', margin:0 },

  messages: {
    flex:1, overflowY:'auto',
    padding:'20px',
    display:'flex', flexDirection:'column', gap:'25px',
  },

  msgRow: { display:'flex', alignItems:'flex-end', gap:'8px' },
  botAvatarSmall: {
    width:'28px', height:'28px',
    background:'linear-gradient(135deg, #378add, #1d6fb5)',
    borderRadius:'50%',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'14px', flexShrink:0,
  },

  bubble: { maxWidth:'78%', padding:'12px 14px', borderRadius:'16px', wordBreak:'break-word' },
  bubbleBot:  { background:'#162d55', border:'1px solid #1e3a5f', borderBottomLeftRadius:'4px' },
  bubbleUser: { background:'linear-gradient(135deg, #378add, #1d6fb5)', borderBottomRightRadius:'4px' },
  // font---------------
  bubbleText: { fontSize:'15px', color:'white', margin:0, lineHeight:1.6 },
  bubbleTime: { fontSize:'11px', color:'#4a7fb5', margin:'5px 0 0', textAlign:'right' },
  windowHint: {
    fontSize:'12px', color:'#f59e0b',
    margin:'8px 0 0', padding:'5px 10px',
    background:'#1a1200', borderRadius:'6px',
    border:'1px solid #3a2800',
  },

  mapBtn: {
    marginTop:'10px', width:'100%',
    background:'#378add', border:'none',
    borderRadius:'10px', color:'white',
    fontSize:'14px', fontWeight:'600',
    padding:'9px 14px', cursor:'pointer',
    fontFamily:'inherit',
  },

  typingDots: { display:'flex', gap:'4px', padding:'2px 0' },
  dot: {
    width:'8px', height:'8px',
    background:'#4a7fb5', borderRadius:'50%',
    display:'inline-block',
    animation:'dotBounce 1s infinite',
  },

  // quick replies always visible
  quickReplies: {
    display:'flex', flexWrap:'wrap', gap:'6px',
    padding:'20px 14px',
    borderTop:'1px solid #1e3a5f',
    flexShrink:0,
    
  },

  quickBtn: {
    background:'#0a1628', border:'1px solid #1e3a5f',
    borderRadius:'20px', color:'#6eb6ff',
    fontSize:'12px', padding:'6px 12px',
    cursor:'pointer', fontFamily:'inherit',
    whiteSpace:'nowrap',
  },

  inputRow: {
    display:'flex', gap:'8px',
    padding:'10px 14px',
    borderTop:'1px solid #1e3a5f',
    flexShrink:0,
  },

  inputDisplay: {
    flex:1, background:'#0a1628',
    border:'1px solid #1e3a5f',
    borderRadius:'20px', color:'white',
    padding:'10px 16px', cursor:'pointer',
    display:'flex', alignItems:'center', gap:'8px',
    minHeight:'42px', transition:'border-color 0.2s',
  },

  inputDisplayActive: { border:'1px solid #378add' },
  clearInput: {
    background:'transparent', border:'none',
    color:'#4a7fb5', fontSize:'14px',
    cursor:'pointer', padding:'0 4px', flexShrink:0,
  },

  sendBtn: {
    background:'#378add', border:'none',
    borderRadius:'50%', color:'white',
    fontSize:'18px', width:'42px', height:'42px',
    cursor:'pointer', display:'flex',
    alignItems:'center', justifyContent:'center',
    flexShrink:0,
  },
  sendBtnDisabled: { background:'#1e3a5f', cursor:'not-allowed' },
  cursor: { color:'#6eb6ff', animation:'blink 1s infinite', marginLeft:'2px', fontWeight:'100' },

  keyboard: {
    background:'#070f1e',
    borderTop:'1px solid #1e3a5f',
    padding:'10px 8px',
    flexShrink:0,
  },

  keyRow: {
    display:'flex', justifyContent:'center',
    gap:'5px', marginBottom:'5px',
  },

  key: {
    background:'#162d55', border:'1px solid #1e3a5f',
    borderRadius:'8px', color:'white',
    fontSize:'16px', fontWeight:'600',
    padding:'11px 0', flex:1,
    maxWidth:'42px', cursor:'pointer',
    fontFamily:'inherit',
  },
  
  keyBackspace: { maxWidth:'48px', background:'#1a1a2e', color:'#ef4444' },
  keySymbol:    { maxWidth:'52px', background:'#0c2d48', color:'#6eb6ff', fontSize:'18px' },
  keyCaps:      { maxWidth:'50px', color:'#4a7fb5' },
  keyCapsOn:    { background:'#1e3a5f', color:'#6eb6ff' },
  keySpace:     { maxWidth:'180px' },
}
