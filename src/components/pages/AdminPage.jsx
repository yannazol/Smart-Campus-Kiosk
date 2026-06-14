import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LOCATIONS, TYPE_META } from '../../data/campusData'

// ─────────────────────────────────────────────────────────────
//  DEMO CREDENTIALS (replace with real JWT auth later)
// ─────────────────────────────────────────────────────────────
const DEMO_USERS = [
  { id: 1, username: 'admin',  password: 'icct2026', role: 'admin' },
  { id: 2, username: 'staff',  password: 'staff123', role: 'staff' },
]

// ─────────────────────────────────────────────────────────────
//  LOGIN PAGE — uses normal HTML inputs (admin has physical keyboard)
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
    <div style={s.loginWrap}>
      <div style={s.loginBox}>
        <div style={s.loginIcon}>🔐</div>
        <p style={s.loginTitle}>Admin Access</p>
        <p style={s.loginSub}>ICCT Smart Campus Navigator</p>

        {error && <div style={s.errBox}>{error}</div>}

        {/* Username */}
        <div style={s.fieldWrap}>
          <label style={s.fieldLabel}>USERNAME</label>
          <input
            style={s.realInput}
            placeholder="Enter username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doLogin()}
            autoFocus
          />
        </div>

        {/* Password */}
        <div style={s.fieldWrap}>
          <label style={s.fieldLabel}>PASSWORD</label>
          <div style={s.pwWrap}>
            <input
              style={{ ...s.realInput, flex: 1 }}
              type={showPw ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doLogin()}
            />
            <button style={s.showPwBtn}
              onClick={() => setShowPw(p => !p)}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button style={s.loginBtn} onClick={doLogin}>
          SIGN IN
        </button>

        <p style={s.loginHint}>
          Demo: <span style={{ color: '#6eb6ff' }}>admin</span> / <span style={{ color: '#6eb6ff' }}>icct2026</span>
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────
function Dashboard({ locations }) {
  const floors    = [...new Set(locations.map(l => l.floor))].length
  const buildings = [...new Set(locations.map(l => l.building).filter(Boolean))].length
  const types     = [...new Set(locations.map(l => l.type))].length

  const stats = [
    { label: 'Total Locations', value: locations.length, icon: '📍', color: '#378add' },
    { label: 'Floors',          value: floors,            icon: '🏢', color: '#1d9e75' },
    { label: 'Buildings',       value: buildings,         icon: '🏫', color: '#f59e0b' },
    { label: 'Location Types',  value: types,             icon: '🗂️', color: '#a78bfa' },
  ]

  return (
    <div>
      <p style={s.sectionTitle}>Dashboard Overview</p>
      <div style={s.statsGrid}>
        {stats.map((st, i) => (
          <div key={i} style={s.statCard}>
            <span style={{ fontSize: 28 }}>{st.icon}</span>
            <p style={{ ...s.statValue, color: st.color }}>{st.value}</p>
            <p style={s.statLabel}>{st.label}</p>
          </div>
        ))}
      </div>
      <div style={s.infoBox}>
        <p style={{ color: '#f59e0b', fontWeight: 700, marginBottom: 6 }}>🔒 Security Note</p>
        <p style={{ color: '#4a7fb5', fontSize: 12, lineHeight: 1.6 }}>
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
function ManageLocations({ locations, setLocations }) {
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
    showToast('✅ Location added!')
  }

  const saveLoc = () => {
    setLocations(prev => prev.map(l => l.id === editLoc.id ? { ...editLoc, x: parseFloat(editLoc.x), y: parseFloat(editLoc.y), floor: parseInt(editLoc.floor) } : l))
    setEditLoc(null)
    showToast('✅ Location updated!')
  }

  const delLoc = (id) => {
    setLocations(prev => prev.filter(l => l.id !== id))
    showToast('🗑️ Location deleted!')
  }

  const filtered = locations.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {toast && <div style={s.toast}>{toast}</div>}
      <p style={s.sectionTitle}>Manage Locations</p>

      {/* Add form */}
      <div style={s.formBox}>
        <p style={s.formTitle}>➕ Add New Location</p>
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
        <button style={s.addBtn} onClick={addLoc}>Add Location</button>
      </div>

      {/* Search */}
      <input style={{ ...s.inp, marginBottom: 10, width: '100%' }}
        placeholder="Search locations..."
        value={search}
        onChange={e => setSearch(e.target.value)}/>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={s.tbl}>
          <thead>
            <tr>
              {['ID','Name','Type','Floor','Building','X','Y','Actions'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(loc => editLoc?.id === loc.id ? (
              <tr key={loc.id} style={{ background: '#0d1f35' }}>
                <td style={s.td}>{loc.id}</td>
                <td style={s.td}><input style={s.inpSm} value={editLoc.name} onChange={e => setEditLoc(f => ({ ...f, name: e.target.value }))}/></td>
                <td style={s.td}>
                  <select style={s.inpSm} value={editLoc.type} onChange={e => setEditLoc(f => ({ ...f, type: e.target.value }))}>
                    {Object.keys(TYPE_META).map(t => <option key={t}>{t}</option>)}
                  </select>
                </td>
                <td style={s.td}><input style={{ ...s.inpSm, width: 50 }} type="number" value={editLoc.floor} onChange={e => setEditLoc(f => ({ ...f, floor: e.target.value }))}/></td>
                <td style={s.td}><input style={s.inpSm} value={editLoc.building || ''} onChange={e => setEditLoc(f => ({ ...f, building: e.target.value }))}/></td>
                <td style={s.td}><input style={{ ...s.inpSm, width: 50 }} type="number" value={editLoc.x} onChange={e => setEditLoc(f => ({ ...f, x: e.target.value }))}/></td>
                <td style={s.td}><input style={{ ...s.inpSm, width: 50 }} type="number" value={editLoc.y} onChange={e => setEditLoc(f => ({ ...f, y: e.target.value }))}/></td>
                <td style={s.td}>
                  <button style={s.sBtnOk} onClick={saveLoc}>✓</button>{' '}
                  <button style={s.sBtnGhost} onClick={() => setEditLoc(null)}>✕</button>
                </td>
              </tr>
            ) : (
              <tr key={loc.id} style={{ borderBottom: '1px solid #0f1f35' }}>
                <td style={s.td}>{loc.id}</td>
                <td style={s.td}>
                  <span style={{ color: TYPE_META[loc.type]?.color || '#94a3b8' }}>
                    {TYPE_META[loc.type]?.icon}
                  </span>{' '}{loc.name}
                </td>
                <td style={s.td}>{loc.type}</td>
                <td style={s.td}>{loc.floor}</td>
                <td style={s.td}>{loc.building || '—'}</td>
                <td style={s.td}>{loc.x}</td>
                <td style={s.td}>{loc.y}</td>
                <td style={s.td}>
                  <button style={s.sBtnOk} onClick={() => setEditLoc({ ...loc })}>✏️</button>{' '}
                  <button style={s.sBtnDanger} onClick={() => delLoc(loc.id)}>🗑️</button>
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
function ManageUsers({ session }) {
  return (
    <div>
      <p style={s.sectionTitle}>Manage Users</p>
      <table style={s.tbl}>
        <thead>
          <tr>{['ID','Username','Role','Status'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {DEMO_USERS.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #0f1f35' }}>
              <td style={s.td}>{u.id}</td>
              <td style={s.td}>{u.username}</td>
              <td style={s.td}>
                <span style={{
                  color: u.role === 'admin' ? '#f59e0b' : '#6eb6ff',
                  fontSize: 10, fontWeight: 800,
                  background: 'rgba(255,255,255,0.04)',
                  padding: '2px 8px', borderRadius: 4,
                  fontFamily: 'monospace',
                }}>
                  {u.role.toUpperCase()}
                </span>
              </td>
              <td style={s.td}>
                <span style={{
                  color: session?.id === u.id ? '#1d9e75' : '#334155',
                  fontSize: 10, fontFamily: 'monospace',
                }}>
                  {session?.id === u.id ? '● ACTIVE' : '○ —'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={s.infoBox}>
        <p style={{ color: '#f59e0b', fontWeight: 700, marginBottom: 6 }}>🔒 Security Note</p>
        <p style={{ color: '#4a7fb5', fontSize: 12, lineHeight: 1.6 }}>
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

  const TABS = [
    { key: 'dashboard', label: 'Dashboard',  icon: '📊' },
    { key: 'locations', label: 'Locations',  icon: '📍' },
    { key: 'users',     label: 'Users',      icon: '👥' },
  ]

  if (!session) {
    return <LoginPage onLogin={setSession}/>
  }

  return (
    <div style={s.page}>

      {/* ── Sidebar ── */}
      <div style={s.sidebar}>
        {/* Logo */}
        <div style={s.sidebarLogo}>
          <div style={s.logoBadge}>ICCT</div>
          <div>
            <p style={s.logoTitle}>Admin Panel</p>
            <p style={s.logoSub}>Campus Navigator</p>
          </div>
        </div>

        {/* Nav items */}
        <nav style={s.nav}>
          {TABS.map(t => (
            <button key={t.key}
              style={{ ...s.navItem, ...(tab === t.key ? s.navItemActive : {}) }}
              onClick={() => setTab(t.key)}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span>{t.label}</span>
              {tab === t.key && <div style={s.navIndicator}/>}
            </button>
          ))}
        </nav>

        {/* Bottom buttons */}
        <div style={s.sidebarBottom}>
          <div style={s.sessionBadge}>
            <span style={{ color: '#1d9e75', fontSize: 10 }}>● ADMIN ACTIVE</span>
            <p style={{ color: '#6eb6ff', fontSize: 12, fontWeight: 700, margin: 0 }}>
              {session.username}
            </p>
          </div>
          <button style={s.signOutBtn} onClick={() => setSession(null)}>
            Sign Out
          </button>
          <button style={s.homeBtn} onClick={() => navigate('/home')}>
            🏠 Back to Kiosk
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <main style={s.main}>
        {tab === 'dashboard' && <Dashboard locations={locations}/>}
        {tab === 'locations' && <ManageLocations locations={locations} setLocations={setLocations}/>}
        {tab === 'users'     && <ManageUsers session={session}/>}
      </main>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────
const s = {
  page: {
    background: '#0a1628', minHeight: '100vh', color: 'white',
    display: 'flex', fontFamily: "'Segoe UI', system-ui, sans-serif",
  },

  // Sidebar
  sidebar: {
    width: '220px', background: '#0f2040',
    borderRight: '1px solid #1e3a5f',
    display: 'flex', flexDirection: 'column',
    flexShrink: 0,
  },
  sidebarLogo: {
    padding: '20px 16px', borderBottom: '1px solid #1e3a5f',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  logoBadge: {
    background: '#378add', color: 'white', fontWeight: 700,
    fontSize: 13, padding: '6px 10px', borderRadius: 8,
    letterSpacing: 2, flexShrink: 0,
  },
  logoTitle: { fontSize: 13, fontWeight: 700, color: 'white', margin: 0 },
  logoSub:   { fontSize: 10, color: '#4a7fb5', margin: 0 },
  nav:       { flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 10,
    background: 'transparent', border: 'none',
    color: '#4a7fb5', fontSize: 13, cursor: 'pointer',
    fontFamily: 'inherit', position: 'relative',
    width: '100%', textAlign: 'left',
    transition: 'all 0.15s',
  },
  navItemActive: { background: '#162d55', color: '#6eb6ff' },
  navIndicator: {
    position: 'absolute', right: 0, top: '20%', bottom: '20%',
    width: 3, background: '#378add', borderRadius: 3,
  },
  sidebarBottom: { padding: '12px 10px', borderTop: '1px solid #1e3a5f' },
  sessionBadge:  { padding: '8px 10px', marginBottom: 8 },
  signOutBtn: {
    width: '100%', background: '#1a0a0a', border: '1px solid #5a1a1a',
    borderRadius: 8, color: '#ff6b6b', fontSize: 12,
    padding: '8px', cursor: 'pointer', fontFamily: 'inherit',
    marginBottom: 6,
  },
  homeBtn: {
    width: '100%', background: '#162d55', border: '1px solid #1e3a5f',
    borderRadius: 8, color: '#6eb6ff', fontSize: 12,
    padding: '8px', cursor: 'pointer', fontFamily: 'inherit',
  },

  // Main
  main: { flex: 1, padding: '24px', overflowY: 'auto' },
  sectionTitle: { fontSize: 20, fontWeight: 700, color: '#6eb6ff', marginBottom: 16 },

  // Dashboard
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 },
  statCard: {
    background: '#0f2040', border: '1px solid #1e3a5f',
    borderRadius: 14, padding: 20,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
  },
  statValue: { fontSize: 32, fontWeight: 700, margin: 0 },
  statLabel: { fontSize: 11, color: '#4a7fb5', textAlign: 'center', margin: 0 },

  // Form
  formBox: {
    background: '#0f2040', border: '1px solid #1e3a5f',
    borderRadius: 12, padding: 16, marginBottom: 14,
  },
  formTitle: { fontSize: 13, fontWeight: 700, color: '#6eb6ff', marginBottom: 10 },
  formGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 },
  inp: {
    background: '#0a1628', border: '1px solid #1e3a5f',
    borderRadius: 8, color: 'white', fontSize: 13,
    padding: '8px 12px', outline: 'none',
    fontFamily: 'inherit', width: '100%',
  },
  inpSm: {
    background: '#0a1628', border: '1px solid #1e3a5f',
    borderRadius: 6, color: 'white', fontSize: 11,
    padding: '4px 8px', outline: 'none',
    fontFamily: 'inherit', width: '100%',
  },
  addBtn: {
    background: '#378add', border: 'none',
    borderRadius: 8, color: 'white', fontSize: 13,
    fontWeight: 600, padding: '10px 20px',
    cursor: 'pointer', fontFamily: 'inherit',
  },

  // Table
  tbl: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th: {
    background: '#0f2040', color: '#4a7fb5',
    padding: '10px 10px', textAlign: 'left',
    borderBottom: '1px solid #1e3a5f',
    fontSize: 10, letterSpacing: '1px',
  },
  td: { padding: '10px 10px', color: '#c8ddf5', verticalAlign: 'middle' },
  sBtnOk:     { fontSize: 12, background: '#0c3028', border: '1px solid #1d9e75', borderRadius: 6, color: '#1d9e75', padding: '3px 8px', cursor: 'pointer' },
  sBtnDanger: { fontSize: 12, background: '#1a0a0a', border: '1px solid #5a1a1a', borderRadius: 6, color: '#ef4444', padding: '3px 8px', cursor: 'pointer' },
  sBtnGhost:  { fontSize: 12, background: 'transparent', border: '1px solid #1e3a5f', borderRadius: 6, color: '#4a7fb5', padding: '3px 8px', cursor: 'pointer' },

  // Info box
  infoBox: {
    background: '#0a1200', border: '1px solid #3a2800',
    borderRadius: 10, padding: 14, marginTop: 14,
  },

  // Toast
  toast: {
    position: 'fixed', bottom: '2rem', left: '50%',
    transform: 'translateX(-50%)',
    background: '#052e16', border: '1px solid #1d9e75',
    borderRadius: 10, color: '#6ee7b7',
    padding: '10px 24px', fontSize: 14,
    fontWeight: 600, zIndex: 9999,
  },

  // Login
  loginWrap: {
    minHeight: '100vh', background: '#0a1628',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  loginBox: {
    background: '#0f2040', border: '1px solid #1e3a5f',
    borderRadius: 20, padding: '40px 48px',
    width: '480px', display: 'flex', flexDirection: 'column', gap: 14,
  },
  loginIcon:  { fontSize: 48, textAlign: 'center' },
  loginTitle: { fontSize: 22, fontWeight: 700, color: 'white', textAlign: 'center', margin: 0 },
  loginSub:   { fontSize: 12, color: '#4a7fb5', textAlign: 'center', margin: 0, fontFamily: 'monospace' },
  loginBtn: {
    background: '#378add', border: 'none', borderRadius: 10,
    color: 'white', fontSize: 15, fontWeight: 700,
    padding: '14px', cursor: 'pointer',
    fontFamily: 'inherit', width: '100%',
    marginTop: 4,
  },
  loginHint: { fontSize: 11, color: '#1e3a5f', textAlign: 'center', fontFamily: 'monospace', margin: 0 },
  errBox: {
    background: '#450a0a', border: '1px solid #ef4444',
    borderRadius: 8, color: '#fca5a5',
    padding: '10px 14px', fontSize: 13,
  },
  fieldWrap:  { display: 'flex', flexDirection: 'column', gap: 4 },
  fieldLabel: { fontSize: 10, color: '#4a7fb5', letterSpacing: '1.5px', fontFamily: 'monospace' },
  realInput: {
    background: '#0a1628', border: '1px solid #1e3a5f',
    borderRadius: 10, color: 'white', fontSize: 15,
    padding: '12px 16px', outline: 'none',
    fontFamily: 'inherit', width: '100%',
    transition: 'border-color 0.2s',
  },
  pwWrap: { display: 'flex', alignItems: 'center', gap: 8 },
  showPwBtn: {
    background: 'transparent', border: 'none',
    fontSize: 18, cursor: 'pointer', flexShrink: 0,
  },
}
