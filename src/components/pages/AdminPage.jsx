import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LOCATIONS, TYPE_META } from '../../data/campusData'
import icctLogo from '../../assets/icct-logo.png'
import campusPhoto from '../../assets/icct-campus.jpg'

// ─────────────────────────────────────────────────────────────
//  DEMO CREDENTIALS (replace with real JWT auth later)
// ─────────────────────────────────────────────────────────────
const DEMO_USERS = [
  { id: 1, username: 'admin',  password: 'icct2026', role: 'admin' },
  { id: 2, username: 'staff',  password: 'staff123', role: 'staff' },
]

// ----------------- Line icons -----------------------------------
const Icon = {
  Lock: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  User: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Eye: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  Shield: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Dashboard: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/>
      <rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
    </svg>
  ),
  Pin: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Users: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Home: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>
    </svg>
  ),
  LogOut: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Building: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="7" x2="9" y2="7.01"/><line x1="15" y1="7" x2="15" y2="7.01"/>
      <line x1="9" y1="12" x2="9" y2="12.01"/><line x1="15" y1="12" x2="15" y2="12.01"/><path d="M9 22v-4h6v4"/>
    </svg>
  ),
  Layers: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  Plus: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Search: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Edit: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>
    </svg>
  ),
  Trash: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Check: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Close: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
}

// ─────────────────────────────────────────────────────────────
//  LOGIN PAGE — glassmorphism with floating labels
// ─────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [showPw, setShowPw]     = useState(false)

  const doLogin = () => {
    const user = DEMO_USERS.find(u => u.username === username && u.password === password)
    if (user) {
      setError('')
      onLogin(user)
    } else {
      setError('Invalid username or password.')
    }
  }

  return (
    <div style={ls.wrap}>
      {/* Background: school campus photo */}
      <div style={ls.ambientWrap}>
        <img src={campusPhoto} alt="" style={ls.campusBg}/>
        <div style={ls.campusOverlay}/>
        <div style={ls.ambient1}/>
        <div style={ls.ambient2}/>
      </div>

      <div style={ls.glassContainer}>
        <img src={icctLogo} alt="ICCT Colleges" style={ls.logoImg}/>
        <p style={ls.title}>Admin Access</p>
        <p style={ls.subtitle}>ICCT Cainta Smart Campus Navigator</p>

        {error && (
          <div style={ls.errBox}>{error}</div>
        )}

        {/* Username — floating label */}
        <div style={ls.inputGroup}>
          <div style={ls.inputIcon}><Icon.User size={18}/></div>
          <input
            style={ls.glassInput}
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doLogin()}
            placeholder=" "
            autoFocus
          />
          <label style={{ ...ls.floatLabel, ...(username ? ls.floatLabelActive : {}) }}>Username</label>
        </div>

        {/* Password — floating label */}
        <div style={ls.inputGroup}>
          <div style={ls.inputIcon}><Icon.Lock size={18}/></div>
          <input
            style={{ ...ls.glassInput, paddingRight: 44 }}
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doLogin()}
            placeholder=" "
          />
          <label style={{ ...ls.floatLabel, ...(password ? ls.floatLabelActive : {}) }}>Password</label>
          <button style={ls.showPwBtn} onClick={() => setShowPw(p => !p)} type="button">
            {showPw ? <Icon.EyeOff size={18}/> : <Icon.Eye size={18}/>}
          </button>
        </div>

        <button style={{ ...ls.signInBtn, marginTop: 8 }} onClick={doLogin}>
          LOG IN
        </button>

        <p style={ls.hint}>
          Demo: <span style={{ color: '#9B9BF5' }}>admin</span> / <span style={{ color: '#9B9BF5' }}>icct2026</span>
        </p>
      </div>
    </div>
  )
}

const ls = {
  wrap: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Inter',system-ui,sans-serif", position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(135deg, #040816 0%, #07182E 50%, #04111D 100%)',
  },
  ambientWrap: { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' },
  campusBg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.14, filter: 'saturate(0.7) brightness(0.8)' },
  campusOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(4,8,22,0.88) 0%, rgba(7,24,46,0.82) 50%, rgba(4,17,29,0.92) 100%)' },
  ambient1: { position: 'absolute', width: '480px', height: '480px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,141,239,0.12) 0%, transparent 70%)', top: '-10%', left: '-8%', filter: 'blur(60px)' },
  ambient2: { position: 'absolute', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.10) 0%, transparent 70%)', bottom: '-10%', right: '-5%', filter: 'blur(65px)' },

  glassContainer: {
    position: 'relative', width: '420px', padding: '44px 40px',
    borderRadius: '24px',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.14)',
    boxShadow: '0 25px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
    zIndex: 10,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
  },
  logoImg: { height: '64px', width: 'auto', marginBottom: 4, filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.4))' },
  title: { fontSize: '22px', fontWeight: 700, color: 'white', margin: 0, textAlign: 'center' },
  subtitle: { fontSize: '13px', color: '#7fa8bd', margin: '0 0 8px', textAlign: 'center' },

  errBox: {
    width: '100%', background: 'rgba(226,85,85,0.12)', border: '1px solid rgba(226,85,85,0.4)',
    borderRadius: 10, color: '#ff9898', padding: '10px 14px', fontSize: 13, textAlign: 'center',
  },

  inputGroup: { position: 'relative', width: '100%' },
  inputIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#7fa8bd', pointerEvents: 'none', display: 'flex' },
  glassInput: {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12,
    color: 'white', fontSize: 15, padding: '16px 16px 16px 44px',
    outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s, background 0.2s',
  },
  floatLabel: {
    position: 'absolute', left: 44, top: '50%', transform: 'translateY(-50%)',
    color: '#7fa8bd', fontSize: 15, pointerEvents: 'none', transition: 'all 0.18s ease',
  },
  floatLabelActive: {
    top: 0, left: 14, fontSize: 11, fontWeight: 600, letterSpacing: '0.5px',
    color: '#9B9BF5', padding: '0 6px', textTransform: 'uppercase',
  },
  showPwBtn: {
    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
    background: 'transparent', border: 'none', color: '#7fa8bd', cursor: 'pointer',
    display: 'flex', padding: 0,
  },

  signInBtn: {
    width: '100%', marginTop: 6,
    background: 'linear-gradient(135deg, #5B8DEF, #A78BFA)', border: 'none',
    borderRadius: 14, color: '#04141f', fontSize: 16, fontWeight: 700,
    padding: '15px', cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 8px 24px rgba(124,124,240,0.35)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  hint: { fontSize: 12, color: '#5a7a8a', textAlign: 'center', margin: 0 },
}

// ─────────────────────────────────────────────────────────────
//  ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────
function timeAgo(date) {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ago`
}

const ACTIVITY_ICON = {
  add: { Icon: Icon.Plus, color: '#4CAF50' },
  edit: { Icon: Icon.Edit, color: '#9B9BF5' },
  delete: { Icon: Icon.Trash, color: '#ff9898' },
}

function Dashboard({ locations, activity }) {
  const floors    = [...new Set(locations.map(l => l.floor))].length
  const buildings = [...new Set(locations.map(l => l.building).filter(Boolean))].length
  const types     = [...new Set(locations.map(l => l.type))].length

  const stats = [
    { label: 'Total Locations', value: locations.length, Icon: Icon.Pin,      color: '#5B8DEF' },
    { label: 'Floors',          value: floors,            Icon: Icon.Layers,   color: '#7C7CF0' },
    { label: 'Buildings',       value: buildings,         Icon: Icon.Building, color: '#A78BFA' },
    { label: 'Location Types',  value: types,             Icon: Icon.Dashboard,color: '#6EA8FE' },
  ]

  return (
    <div>
      <p style={s.sectionTitle}>Dashboard Overview</p>
      <div style={s.statsGrid}>
        {stats.map((st, i) => (
          <div key={i} style={s.statCard}>
            <div style={{ color: st.color }}><st.Icon size={32}/></div>
            <p style={{ ...s.statValue, color: st.color }}>{st.value}</p>
            <p style={s.statLabel}>{st.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Log */}
      <div style={s.activityBox}>
        <p style={s.activityTitle}><Icon.Layers size={15}/> Recent Activity</p>
        {activity.length === 0 ? (
          <p style={s.activityEmpty}>No recent changes yet. Activity from Locations and Users will appear here.</p>
        ) : (
          <div style={s.activityList}>
            {activity.map((a, i) => {
              const meta = ACTIVITY_ICON[a.action] || ACTIVITY_ICON.edit
              return (
                <div key={i} style={s.activityRow}>
                  <div style={{ ...s.activityIcon, color: meta.color, borderColor: meta.color + '55' }}>
                    <meta.Icon size={14}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={s.activityDetail}>{a.detail}</p>
                  </div>
                  <span style={s.activityTime}>{timeAgo(a.time)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={s.infoBox}>
        <p style={s.infoBoxTitle}><Icon.Shield size={16}/> Security Note</p>
        <p style={s.infoBoxText}>
          Production deployment uses bcrypt password hashing, signed JWTs (HS256) with 1h expiry,
          HTTPS-only via IIS, RBAC middleware, rate limiting on login endpoint, and audit logging.
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  MANAGE LOCATIONS
// ─────────────────────────────────────────────────────────────
function ManageLocations({ locations, setLocations, logActivity }) {
  const empty = { name: '', type: 'office', floor: 1, building: '', x: '', y: '', desc: '' }
  const [newLoc,  setNewLoc]  = useState(empty)
  const [editLoc, setEditLoc] = useState(null)
  const [toast,   setToast]   = useState('')
  const [search,  setSearch]  = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const addLoc = () => {
    if (!newLoc.name.trim()) return
    const loc = { ...newLoc, id: Date.now(), x: parseFloat(newLoc.x), y: parseFloat(newLoc.y), floor: parseInt(newLoc.floor) }
    setLocations(prev => [...prev, loc])
    setNewLoc(empty)
    showToast('Location added')
    logActivity?.('add', `Added location "${loc.name}"`)
  }

  const saveLoc = () => {
    setLocations(prev => prev.map(l => l.id === editLoc.id ? { ...editLoc, x: parseFloat(editLoc.x), y: parseFloat(editLoc.y), floor: parseInt(editLoc.floor) } : l))
    setEditLoc(null)
    showToast('Location updated')
    logActivity?.('edit', `Edited location "${editLoc.name}"`)
  }

  const delLoc = (id) => {
    const loc = locations.find(l => l.id === id)
    setLocations(prev => prev.filter(l => l.id !== id))
    showToast('Location deleted')
    logActivity?.('delete', `Deleted location "${loc?.name || id}"`)
  }

  const filtered = locations.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {toast && <div style={s.toast}><Icon.Check size={14}/> {toast}</div>}
      <p style={s.sectionTitle}>Manage Locations</p>

      {/* Add form */}
      <div style={s.formBox}>
        <p style={s.formTitle}><Icon.Plus size={14}/> Add New Location</p>
        <div style={s.formGrid}>
          <input style={s.inp} placeholder="Name" value={newLoc.name}
            onChange={e => setNewLoc(f => ({ ...f, name: e.target.value }))}/>
          <select style={s.inp} value={newLoc.type}
            onChange={e => setNewLoc(f => ({ ...f, type: e.target.value }))}>
            {Object.keys(TYPE_META).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input style={s.inp} type="number" placeholder="Floor" value={newLoc.floor}
            onChange={e => setNewLoc(f => ({ ...f, floor: e.target.value }))}/>
          <input style={s.inp} placeholder="Building" value={newLoc.building}
            onChange={e => setNewLoc(f => ({ ...f, building: e.target.value }))}/>
          <input style={s.inp} type="number" placeholder="X coordinate" value={newLoc.x}
            onChange={e => setNewLoc(f => ({ ...f, x: e.target.value }))}/>
          <input style={s.inp} type="number" placeholder="Y coordinate" value={newLoc.y}
            onChange={e => setNewLoc(f => ({ ...f, y: e.target.value }))}/>
          <input style={{ ...s.inp, gridColumn: '1/-1' }} placeholder="Description (optional)" value={newLoc.desc}
            onChange={e => setNewLoc(f => ({ ...f, desc: e.target.value }))}/>
        </div>
        <button style={s.addBtn} onClick={addLoc}><Icon.Plus size={14}/> Add Location</button>
      </div>

      {/* Search */}
      <div style={s.searchWrap}>
        <span style={{ color: '#7fa8bd', display: 'flex' }}><Icon.Search size={16}/></span>
        <input style={s.searchInp}
          placeholder="Search locations..."
          value={search}
          onChange={e => setSearch(e.target.value)}/>
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.tbl}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              {['ID','Name','Type','Floor','Building','Actions'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(loc => editLoc?.id === loc.id ? (
              <tr key={loc.id} style={{ background: 'rgba(124,124,240,0.08)' }}>
                <td style={s.td}>{loc.id}</td>
                <td style={s.td}><input style={s.inpSm} value={editLoc.name} onChange={e => setEditLoc(f => ({ ...f, name: e.target.value }))}/></td>
                <td style={s.td}>
                  <select style={s.inpSm} value={editLoc.type} onChange={e => setEditLoc(f => ({ ...f, type: e.target.value }))}>
                    {Object.keys(TYPE_META).map(t => <option key={t}>{t}</option>)}
                  </select>
                </td>
                <td style={s.td}><input style={{ ...s.inpSm, width: 60 }} type="number" value={editLoc.floor} onChange={e => setEditLoc(f => ({ ...f, floor: e.target.value }))}/></td>
                <td style={s.td}><input style={s.inpSm} value={editLoc.building || ''} onChange={e => setEditLoc(f => ({ ...f, building: e.target.value }))}/></td>
                <td style={s.td}>
                  <button style={s.sBtnOk} onClick={saveLoc}><Icon.Check size={13}/></button>{' '}
                  <button style={s.sBtnGhost} onClick={() => setEditLoc(null)}><Icon.Close size={13}/></button>
                </td>
              </tr>
            ) : (
              <tr key={loc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={s.td}>{loc.id}</td>
                <td style={s.td}>
                  <span style={{ color: TYPE_META[loc.type]?.color || '#94a3b8', fontSize: 11, fontFamily: 'monospace', marginRight: 6 }}>
                    {loc.type}
                  </span>{loc.name}
                </td>
                <td style={s.td}>{loc.type}</td>
                <td style={s.td}>{loc.floor}</td>
                <td style={s.td}>{loc.building || '—'}</td>
                <td style={s.td}>
                  <button style={s.sBtnOk} onClick={() => setEditLoc({ ...loc })}><Icon.Edit size={13}/> Edit</button>{' '}
                  <button style={s.sBtnDanger} onClick={() => delLoc(loc.id)}><Icon.Trash size={13}/> Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  MANAGE USERS
// ─────────────────────────────────────────────────────────────
function ManageUsers({ session, logActivity }) {
  const emptyUser = { username: '', password: '', role: 'staff' }
  const [users, setUsers]       = useState(DEMO_USERS)
  const [newUser, setNewUser]   = useState(emptyUser)
  const [editUser, setEditUser] = useState(null)
  const [toast, setToast]       = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const addUser = () => {
    if (!newUser.username.trim() || !newUser.password.trim()) return
    const user = { ...newUser, id: Date.now() }
    setUsers(prev => [...prev, user])
    setNewUser(emptyUser)
    showToast('User added')
    logActivity?.('add', `Added user "${user.username}"`)
  }

  const saveUser = () => {
    setUsers(prev => prev.map(u => u.id === editUser.id ? editUser : u))
    setEditUser(null)
    showToast('User updated')
    logActivity?.('edit', `Edited user "${editUser.username}"`)
  }

  const delUser = (id) => {
    if (session?.id === id) { showToast('Cannot delete active user'); return }
    const u = users.find(x => x.id === id)
    setUsers(prev => prev.filter(u => u.id !== id))
    showToast('User deleted')
    logActivity?.('delete', `Deleted user "${u?.username || id}"`)
  }

  return (
    <div>
      {toast && <div style={s.toast}><Icon.Check size={14}/> {toast}</div>}
      <p style={s.sectionTitle}>Manage Users</p>

      {/* Add user form */}
      <div style={s.formBox}>
        <p style={s.formTitle}><Icon.Plus size={14}/> Add New User</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
          <input style={s.inp} placeholder="Username"
            value={newUser.username}
            onChange={e => setNewUser(f => ({ ...f, username: e.target.value }))}/>
          <input style={s.inp} placeholder="Password" type="password"
            value={newUser.password}
            onChange={e => setNewUser(f => ({ ...f, password: e.target.value }))}/>
          <select style={s.inp} value={newUser.role}
            onChange={e => setNewUser(f => ({ ...f, role: e.target.value }))}>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <button style={s.addBtn} onClick={addUser}><Icon.Plus size={14}/> Add User</button>
      </div>

      {/* Users table */}
      <div style={s.tableWrap}>
        <table style={s.tbl}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>{['ID','Username','Role','Status','Actions'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {users.map(u => editUser?.id === u.id ? (
              <tr key={u.id} style={{ background: 'rgba(124,124,240,0.08)' }}>
                <td style={s.td}>{u.id}</td>
                <td style={s.td}>
                  <input style={s.inpSm} value={editUser.username}
                    onChange={e => setEditUser(f => ({ ...f, username: e.target.value }))}/>
                </td>
                <td style={s.td}>
                  <input style={s.inpSm} value={editUser.password} type="text"
                    onChange={e => setEditUser(f => ({ ...f, password: e.target.value }))}/>
                </td>
                <td style={s.td}>
                  <select style={s.inpSm} value={editUser.role}
                    onChange={e => setEditUser(f => ({ ...f, role: e.target.value }))}>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                </td>
                <td style={s.td}>
                  <button style={s.sBtnOk} onClick={saveUser}><Icon.Check size={13}/> Save</button>{' '}
                  <button style={s.sBtnGhost} onClick={() => setEditUser(null)}><Icon.Close size={13}/></button>
                </td>
              </tr>
            ) : (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={s.td}>{u.id}</td>
                <td style={s.td}>{u.username}</td>
                <td style={s.td}>
                  <span style={{
                    color: u.role === 'admin' ? '#FFC857' : '#9B9BF5',
                    fontSize: 11, fontWeight: 800,
                    background: 'rgba(255,255,255,0.04)',
                    padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace',
                  }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={s.td}>
                  <span style={{
                    color: session?.id === u.id ? '#4CAF50' : '#5a7a8a',
                    fontSize: 11, fontFamily: 'monospace',
                  }}>
                    {session?.id === u.id ? '● ACTIVE' : '○ —'}
                  </span>
                </td>
                <td style={s.td}>
                  <button style={s.sBtnOk} onClick={() => setEditUser({ ...u })}><Icon.Edit size={13}/> Edit</button>{' '}
                  <button style={s.sBtnDanger} onClick={() => delUser(u.id)}><Icon.Trash size={13}/> Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={s.infoBox}>
        <p style={s.infoBoxTitle}><Icon.Shield size={16}/> Security Note</p>
        <p style={s.infoBoxText}>
          Production deployment uses bcrypt password hashing, signed JWTs (HS256) with 1h expiry,
          HTTPS-only via IIS, RBAC middleware, and rate limiting on login endpoint.
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  MAIN ADMIN PAGE
// ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate  = useNavigate()
  const [session, setSession]   = useState(null)
  const [tab,     setTab]       = useState('dashboard')
  const [locations, setLocations] = useState(LOCATIONS)
  const [activity, setActivity] = useState([])

  const logActivity = (action, detail) => {
    setActivity(prev => [{ action, detail, time: new Date() }, ...prev].slice(0, 8))
  }

  const TABS = [
    { key: 'dashboard', label: 'Dashboard',  IconC: Icon.Dashboard },
    { key: 'locations', label: 'Locations',  IconC: Icon.Pin },
    { key: 'users',     label: 'Users',      IconC: Icon.Users },
  ]

  if (!session) {
    return <LoginPage onLogin={setSession}/>
  }

  return (
    <div style={s.page} className="admin-root">
      <style>{`
        .admin-root { font-size: calc(12px + 0.3vw); }
        .admin-root table { font-size: calc(11px + 0.25vw); }
        .admin-root input, .admin-root select, .admin-root button {
          font-size: calc(11px + 0.25vw) !important;
        }
        .admin-root select { color-scheme: dark; }
        .admin-root select option {
          background: #0c1830;
          color: #dceaf9;
        }
      `}</style>

      {/* Background to match Home/MapPage */}
      <div style={s.ambientWrap}>
        <div style={s.ambient1}/>
        <div style={s.ambient2}/>
      </div>

      {/* ── Sidebar — glass ── */}
      <div style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <img src={icctLogo} alt="ICCT" style={s.sidebarLogoImg}/>
          <div>
            <p style={s.logoTitle}>Admin Panel</p>
            <p style={s.logoSub}>Campus Navigator</p>
          </div>
        </div>

        <nav style={s.nav}>
          {TABS.map(t => (
            <button key={t.key}
              style={{ ...s.navItem, ...(tab === t.key ? s.navItemActive : {}) }}
              onClick={() => setTab(t.key)}>
              <span style={{ display: 'flex' }}><t.IconC size={18}/></span>
              <span>{t.label}</span>
              {tab === t.key && <div style={s.navIndicator}/>}
            </button>
          ))}
        </nav>

        <div style={s.sidebarBottom}>
          <div style={s.sessionBadge}>
            <span style={{ color: '#4CAF50', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>● ADMIN ACTIVE</span>
            <p style={{ color: '#9B9BF5', fontSize: 13, fontWeight: 700, margin: '4px 0 0' }}>
              {session.username}
            </p>
          </div>
          <button style={s.signOutBtn} onClick={() => setSession(null)}>
            <Icon.LogOut size={14}/> Sign Out
          </button>
          <button style={s.homeBtn} onClick={() => navigate('/home')}>
            <Icon.Home size={14}/> Back to Kiosk
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <main style={s.main}>
        {tab === 'dashboard' && <Dashboard locations={locations} activity={activity}/>}
        {tab === 'locations' && <ManageLocations locations={locations} setLocations={setLocations} logActivity={logActivity}/>}
        {tab === 'users'     && <ManageUsers session={session} logActivity={logActivity}/>}
      </main>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  STYLES — glassmorphism, matches Home/MapPage palette
// ─────────────────────────────────────────────────────────────
const s = {
  page: {
    background: 'linear-gradient(135deg, #040816 0%, #07182E 50%, #04111D 100%)',
    minHeight: '100vh', color: 'white',
    display: 'flex', fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 'calc(12px + 0.3vw)', position: 'relative', overflow: 'hidden',
  },

  ambientWrap: { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' },
  ambient1: { position: 'absolute', width: '460px', height: '460px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,141,239,0.08) 0%, transparent 70%)', top: '-12%', left: '15%', filter: 'blur(70px)' },
  ambient2: { position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)', bottom: '-10%', right: '10%', filter: 'blur(70px)' },

  // Sidebar — glassy pang bongga para sosyal-----
  sidebar: {
    width: 'calc(190px + 3vw)',
    background: 'rgba(7,24,46,0.55)',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', flexDirection: 'column',
    flexShrink: 0, position: 'relative', zIndex: 2,
  },
  sidebarLogo: {
    padding: 'calc(16px + 0.3vw) 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  sidebarLogoImg: { height: '52px', width: 'auto', flexShrink: 0, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' },
  logoTitle: { fontSize: 'calc(12px + 0.2vw)', fontWeight: 700, color: 'white', margin: 0 },
  logoSub:   { fontSize: 'calc(9px + 0.15vw)', color: '#7fa8bd', margin: 0 },
  nav:       { flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '11px 12px', borderRadius: 10,
    background: 'transparent', border: 'none',
    color: '#7fa8bd', fontSize: 13, cursor: 'pointer',
    fontFamily: 'inherit', position: 'relative',
    width: '100%', textAlign: 'left',
    transition: 'all 0.15s',
  },
  navItemActive: { background: 'rgba(124,124,240,0.15)', color: '#9B9BF5' },
  navIndicator: {
    position: 'absolute', right: 0, top: '20%', bottom: '20%',
    width: 3, background: '#7C7CF0', borderRadius: 3,
  },
  sidebarBottom: { padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' },
  sessionBadge:  { padding: '8px 10px', marginBottom: 8 },
  signOutBtn: {
    width: '100%', background: 'rgba(226,85,85,0.1)', border: '1px solid rgba(226,85,85,0.3)',
    borderRadius: 8, color: '#ff9898', fontSize: 12,
    padding: '9px', cursor: 'pointer', fontFamily: 'inherit',
    marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  homeBtn: {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,124,240,0.3)',
    borderRadius: 8, color: '#9B9BF5', fontSize: 12,
    padding: '9px', cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  },

  // Main
  main: { flex: 1, padding: 'calc(16px + 0.5vw)', overflowY: 'auto', position: 'relative', zIndex: 1 },
  sectionTitle: { fontSize: 'calc(16px + 0.4vw)', fontWeight: 700, color: '#9B9BF5', marginBottom: 16 },

  // Dashboard
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 24 },
  statCard: {
    background: 'rgba(7,18,32,0.5)', backdropFilter: 'blur(16px) saturate(160%)', WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 18, padding: '32px 22px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  statValue: { fontSize: 44, fontWeight: 700, margin: 0 },
  statLabel: { fontSize: 13, color: '#7fa8bd', textAlign: 'center', margin: 0, fontWeight: 500 },

  // Form
  formBox: {
    background: 'rgba(7,18,32,0.5)', backdropFilter: 'blur(16px) saturate(160%)', WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14, padding: 16, marginBottom: 14,
  },
  formTitle: { fontSize: 13, fontWeight: 700, color: '#9B9BF5', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 },
  formGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 },
  inp: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: 'white', fontSize: 13,
    padding: '9px 12px', outline: 'none',
    fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
  },
  inpSm: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6, color: 'white', fontSize: 11,
    padding: '4px 8px', outline: 'none',
    fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
  },
  addBtn: {
    background: 'linear-gradient(135deg, #5B8DEF, #A78BFA)', border: 'none',
    borderRadius: 10, color: '#04141f', fontSize: 13,
    fontWeight: 700, padding: '11px 22px',
    cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', gap: 6,
    boxShadow: '0 4px 16px rgba(124,124,240,0.3)',
  },

  // Search
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    padding: '10px 14px', marginBottom: 12,
  },
  searchInp: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: 'white', fontSize: 14, fontFamily: 'inherit',
  },

  // Table
  tableWrap: {
    overflowY: 'auto', maxHeight: 'calc(100vh - 420px)', borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(7,18,32,0.4)', backdropFilter: 'blur(16px) saturate(160%)', WebkitBackdropFilter: 'blur(16px) saturate(160%)',
  },
  tbl: { width: '100%', borderCollapse: 'collapse', fontSize: 'calc(11px + 0.25vw)' },
  th: {
    background: 'rgba(255,255,255,0.04)', color: '#7fa8bd',
    padding: 'calc(8px + 0.2vw) calc(8px + 0.2vw)', textAlign: 'left',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    fontSize: 'calc(9px + 0.2vw)', letterSpacing: '1px', fontWeight: 600,
  },
  td: { padding: 'calc(8px + 0.2vw)', color: '#dceaf9', verticalAlign: 'middle' },
  sBtnOk:     { fontSize: 12, background: 'rgba(76,175,80,0.12)', border: '1px solid rgba(76,175,80,0.4)', borderRadius: 6, color: '#4CAF50', padding: '4px 9px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 },
  sBtnDanger: { fontSize: 12, background: 'rgba(226,85,85,0.1)', border: '1px solid rgba(226,85,85,0.35)', borderRadius: 6, color: '#ff9898', padding: '4px 9px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 },
  sBtnGhost:  { fontSize: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#7fa8bd', padding: '4px 9px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 },

  // Info box
  infoBox: {
    background: 'rgba(255,200,87,0.06)', border: '1px solid rgba(255,200,87,0.25)',
    borderRadius: 12, padding: 16, marginTop: 14,
    backdropFilter: 'blur(8px)',
  },
  infoBoxTitle: { color: '#FFC857', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 },
  infoBoxText: { color: '#a8c5d4', fontSize: 12, lineHeight: 1.6, margin: 0 },

  // Activity log
  activityBox: {
    background: 'rgba(7,18,32,0.5)', backdropFilter: 'blur(16px) saturate(160%)', WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 20, marginTop: 4,
  },
  activityTitle: { fontSize: 14, fontWeight: 700, color: '#9B9BF5', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 },
  activityEmpty: { fontSize: 13, color: '#5a7a8a', lineHeight: 1.6, margin: 0 },
  activityList: { display: 'flex', flexDirection: 'column', gap: 4 },
  activityRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 8px', borderRadius: 10,
    transition: 'background 0.15s',
  },
  activityIcon: {
    width: 30, height: 30, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid', background: 'rgba(255,255,255,0.03)', flexShrink: 0,
  },
  activityDetail: { fontSize: 13, color: '#dceaf9', margin: 0 },
  activityTime: { fontSize: 11, color: '#5a7a8a', flexShrink: 0, fontFamily: 'monospace' },

  // Toast
  toast: {
    position: 'fixed', bottom: '2rem', left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(76,175,80,0.15)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(76,175,80,0.4)',
    borderRadius: 12, color: '#86e092',
    padding: '12px 24px', fontSize: 14,
    fontWeight: 600, zIndex: 9999,
    display: 'flex', alignItems: 'center', gap: 8,
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  },
}
