import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FLOOR_BLOCKS, FLOOR_LABELS } from '../../data/campusData'
import icctLogo from '../../assets/icct-logo.png'
import campusPhoto from '../../assets/icct-campus.jpg'

const POPULAR = ['Registrar', 'Library', 'Canteen', 'Guidance Office', 'Accounting', 'Academic Affairs', 'Theater']
const CATEGORIES = ['Offices', 'Laboratories', 'Rooms', 'Facilities']
const ALL_LOCATIONS = [
  'Registrar', 'Library', 'Canteen', 'Guidance Office', 'Accounting',
  'Academic Affairs', 'Theater', 'Computer Laboratory 1',
  'Computer Laboratory 2', "Dean's Office", 'IT Laboratory',
  'Room 301', 'Room 302', 'Room 303', 'Clinic', 'Registrar',
  'Gymnasium', 'Auditorium', 'Security Office',
]
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '-', '.'],
]
const NUMBER_ROW = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

// ---- Line icons - minimalist stroke style, no fill ------------
const Icon = {
  Search: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Pin: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Columns: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/>
    </svg>
  ),
  Monitor: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  Building: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="7" x2="9" y2="7.01"/><line x1="15" y1="7" x2="15" y2="7.01"/>
      <line x1="9" y1="12" x2="9" y2="12.01"/><line x1="15" y1="12" x2="15" y2="12.01"/><path d="M9 22v-4h6v4"/>
    </svg>
  ),
  Flask: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2v6L3.5 18.5A2 2 0 0 0 5.3 21h13.4a2 2 0 0 0 1.8-2.5L15 8V2"/><line x1="8" y1="2" x2="16" y2="2"/><line x1="8.5" y1="13" x2="15.5" y2="13"/>
    </svg>
  ),
  Close: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Flame: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17a2.5 2.5 0 0 0 2.5-2.5c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7.5 7.5 0 1 1-15 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  ),
  Tag: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
}

// ---- Building configuration — name, color, icon, floors, and mini-map viewbox for floor plan cropping ----
const BUILDINGS = [
  { id: 'Building 1', short: 'B1', color: '#0e417b', glow: 'rgba(74,144,226,0.30)',  Icon: Icon.Building, floors: [1,2,3,4] },
  { id: 'Building 2', short: 'B2', color: '#a09363', glow: 'rgba(245,197,24,0.30)',  Icon: Icon.Building, floors: [1,2,3,4] },
  { id: 'Building 3', short: 'B3', color: '#317633', glow: 'rgba(76,175,80,0.30)',   Icon: Icon.Building, floors: [1,2,3,4] },
  { id: 'Building 4', short: 'B4', color: '#7c3785', glow: 'rgba(226,85,85,0.30)',   Icon: Icon.Building, floors: [1,2,3,4] },
]

const BUILDING_VIEWBOX = {
  'Building 1': { x: 11.5, y: 11, w: 10, h: 10 },
  'Building 2': { x: 11.5, y: 0,  w: 10, h: 10 },
  'Building 3': { x: 0.5,  y: 11, w: 10, h: 10 },
  'Building 4': { x: 0.5,  y: 0,  w: 10, h: 10 },
}

// ---- Mini Building Map ----
function MiniBuildingMap({ buildingName, floor, color }) {
  const blocks = FLOOR_BLOCKS[floor] || FLOOR_BLOCKS[1]
  const region = BUILDING_VIEWBOX[buildingName]
  if (!region) return null

  const W = 260, H = 200, PAD = 8
  const sx = x => PAD + ((x - region.x) / region.w) * (W - PAD * 2)
  const sy = y => PAD + ((y - region.y) / region.h) * (H - PAD * 2)

  const buildingBlocks = blocks.filter(b => {
    if (b.label === buildingName) return true
    if (b.type === 'building' || b.type === 'hallway') return false
    const bRight = b.x + b.w, bBottom = b.y + b.h
    const rRight = region.x + region.w, rBottom = region.y + region.h
    return b.x < rRight && bRight > region.x && b.y < rBottom && bBottom > region.y
  })

  const typeFill = { office:'#0d2436', lab:'#0d2b30', facility:'#0a1d2a', stairs:'#16323d', elevator:'#1a3f4a', hallway:'#081420', building:'#081420' }

  function roomLabel(label, bw, bh) {
    if (!label || label.trim() === '') return { lines: [], fontSize: 6, lineH: 8 }
    const fontSize = Math.max(4.5, Math.min(7, bw / 10))
    const charsPerLine = Math.max(4, Math.floor(bw / (fontSize * 0.58)))
    const maxLines = Math.max(1, Math.floor(bh / (fontSize + 2.5)))
    const words = label.split(' ')
    const lines = []
    let cur = ''
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w
      if (test.length > charsPerLine && cur) { lines.push(cur); cur = w } else cur = test
    }
    if (cur) lines.push(cur)
    return { lines: lines.slice(0, maxLines), fontSize, lineH: fontSize + 2.5 }
  }

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', background: '#081420', borderRadius: 8 }}>
      <rect x={PAD} y={PAD} width={W-PAD*2} height={H-PAD*2} rx="4" fill="#081420" stroke={color} strokeWidth="1.5"/>
      {buildingBlocks.filter(b => b.label !== buildingName).map((b, i) => {
        const bx=sx(b.x), by=sy(b.y), bw=sx(b.x+b.w)-sx(b.x), bh=sy(b.y+b.h)-sy(b.y)
        if (bw < 2 || bh < 2) return null
        const fill = typeFill[b.type] || '#0d2030'
        const stroke = b.type==='stairs' ? color+'88' : b.type==='elevator' ? color : '#1e3a48'
        const cx=bx+bw/2, cy=by+bh/2
        const {lines, fontSize, lineH} = roomLabel(b.label, bw, bh)
        const totalH=lines.length*lineH, startY=cy-totalH/2+lineH/2
        return (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={bh} rx="2" fill={fill} stroke={stroke} strokeWidth="0.8" opacity="0.95"/>
            {bw>14 && bh>8 && lines.map((line,li) => (
              <text key={li} x={cx} y={startY+li*lineH} textAnchor="middle" dominantBaseline="middle"
                style={{fontSize, fill:'#3a7a8e', fontFamily:'monospace', pointerEvents:'none', userSelect:'none'}}>{line}</text>
            ))}
          </g>
        )
      })}
      <text x={W/2} y={H/2} textAnchor="middle" dominantBaseline="middle"
        style={{fontSize:48, fill:color, fontFamily:'monospace', fontWeight:700, opacity:0.06, pointerEvents:'none', userSelect:'none'}}>
        {buildingName.replace('Building ','B')}
      </text>
      <text x={W-PAD-2} y={H-PAD-2} textAnchor="end" dominantBaseline="auto"
        style={{fontSize:8, fill:color, fontFamily:'monospace', fontWeight:700, opacity:0.7}}>
        {FLOOR_LABELS[floor] || `Floor ${floor}`}
      </text>
    </svg>
  )
}

// ---- Flip Card — glassmorphism ----
function BuildingCard({ building }) {
  const [flipped, setFlipped] = useState(false)
  const [activeFloor, setActiveFloor] = useState(1)
  const CardIcon = building.Icon

  return (
    <div
      style={{ width: '100%', height: '100%', perspective: '1000px', cursor: 'pointer' }}
      onClick={() => setFlipped(f => !f)}
    >
      <style>{`
        .card-inner {
          position: relative; width: 100%; height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-inner.flipped { transform: rotateY(180deg); }
        .card-face {
          position: absolute; inset: 0;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 20px;
          overflow: hidden;
        }
        .card-back { transform: rotateY(180deg); }
      `}</style>

      <div className={`card-inner${flipped ? ' flipped' : ''}`}>

        {/* ── Front — glass ── */}
        <div className="card-face" style={{
          background: `linear-gradient(135deg, ${building.color}14 0%, rgba(7,24,46,0.65) 60%)`,
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          border: `1px solid rgba(255,255,255,0.08)`,
          boxShadow: `0 8px 28px ${building.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${building.color}99, transparent)` }} />
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${building.color}1a 0%, transparent 60%)`, pointerEvents: 'none' }} />

          <div style={{ marginBottom: '16px', position: 'relative', color: building.color }}>
            <CardIcon size={42}/>
          </div>
          <div style={{ fontSize: '40px', fontWeight: '700', letterSpacing: '1px', fontFamily: "'Inter',sans-serif", color: building.color, lineHeight: 1, marginBottom: '8px', position: 'relative', textShadow: `0 0 16px ${building.color}66` }}>{building.short}</div>
          <div style={{ fontSize: '14px', color: '#a8c5d4', fontWeight: '500', marginBottom: '20px', position: 'relative' }}>{building.id}</div>
          <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", fontWeight: '600', color: building.color + 'cc', position: 'relative' }}>Tap to see map</div>
        </div>

        {/* ── Back — glass ── */}
        <div className="card-face card-back" style={{
          background: 'rgba(7,18,32,0.72)',
          backdropFilter: 'blur(22px) saturate(160%)',
          WebkitBackdropFilter: 'blur(22px) saturate(160%)',
          border: `1px solid rgba(255,255,255,0.08)`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)`,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${building.color}99, transparent)`, flexShrink: 0 }} />

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px 10px', borderBottom: `1px solid rgba(255,255,255,0.06)`, flexShrink: 0,
          }}>
            <span style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px', fontFamily: "'Inter',sans-serif", color: building.color }}>{building.id}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {building.floors.map(f => (
                <button key={f}
                  onClick={e => { e.stopPropagation(); setActiveFloor(f) }}
                  style={{
                    background: activeFloor === f ? building.color : 'rgba(255,255,255,0.04)',
                    backdropFilter: activeFloor === f ? 'none' : 'blur(4px)',
                    border: `1px solid ${activeFloor === f ? building.color : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '8px',
                    color: activeFloor === f ? '#04141f' : '#a8c5d4',
                    fontSize: '10px', fontWeight: '700',
                    padding: '4px 8px', cursor: 'pointer',
                    fontFamily: "'Inter',sans-serif", transition: 'all 0.15s',
                  }}
                >
                  {f === 1 ? 'GF' : `${f}F`}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, padding: '8px', minHeight: 0, overflow: 'hidden' }}>
            <MiniBuildingMap buildingName={building.id} floor={activeFloor} color={building.color} />
          </div>

          <div style={{
            textAlign: 'center', padding: '6px 0 10px',
            fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase',
            fontFamily: "'Inter',sans-serif", fontWeight: '600', color: building.color + '99', flexShrink: 0,
          }}>
            Tap to flip back
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Main Home ──────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [time, setTime] = useState(new Date())
  const [recommendations, setRecommendations] = useState([])
  const [capsOn, setCapsOn] = useState(true)

  const backspacePressTimer = useRef(null)
  const backspaceHoldTimer = useRef(null)
  const isHolding = useRef(false)
  const longPressTimer = useRef(null)

  useEffect(() => {
    if (!document.getElementById('inter-font')) {
      const link = document.createElement('link')
      link.id = 'inter-font'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
      document.head.appendChild(link)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    return () => {
      clearTimeout(longPressTimer.current)
      clearTimeout(backspacePressTimer.current)
      clearTimeout(backspaceHoldTimer.current)
    }
  }, [])

  useEffect(() => {
    if (search.trim().length > 0) {
      const filtered = ALL_LOCATIONS.filter(loc =>
        loc.toLowerCase().includes(search.toLowerCase())
      )
      setRecommendations(filtered)
    } else {
      setRecommendations([])
    }
  }, [search])

  const handleCornerPressStart = (e) => {
    e.preventDefault()
    longPressTimer.current = setTimeout(() => navigate('/admin'), 6000)
  }
  const handleCornerPressEnd = () => clearTimeout(longPressTimer.current)

  const formatTime = (date) => date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const formatDate = (date) => date.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const handleSearch = (term) => {
    setSearch(term)
    setRecommendations([])
    setIsSearching(false)
    navigate(`/map?destination=${encodeURIComponent(term)}`)
  }

  const handleKey = (key) => {
    const char = capsOn ? key.toUpperCase() : key.toLowerCase()
    setSearch(prev => prev + char)
  }

  const handleNumber = (num) => setSearch(prev => prev + num)

  const handleBackspace = useCallback(() => {
    setSearch(prev => prev.slice(0, -1))
  }, [])

  const handleClear = () => { setSearch(''); setRecommendations([]) }
  const handleOutsideClick = () => setIsSearching(false)

  const handleBackspaceDown = (e) => {
    e.preventDefault()
    isHolding.current = false
    backspacePressTimer.current = setTimeout(() => {
      isHolding.current = true
      setSearch(''); setRecommendations([])
    }, 600)
  }

  const handleBackspaceUp = (e) => {
    e.preventDefault()
    clearTimeout(backspacePressTimer.current)
    clearTimeout(backspaceHoldTimer.current)
    if (!isHolding.current) handleBackspace()
    isHolding.current = false
  }

  return (
    <div style={styles.page}>

      {/* Background: campus photo + dark overlay gradient — gives glass real texture */}
      <div style={styles.ambientWrap}>
        <img src={campusPhoto} alt="" style={styles.campusBg}/>
        <div style={styles.campusOverlay}/>
        <div style={styles.ambient1}/>
        <div style={styles.ambient2}/>
        <div style={styles.ambient3}/>
      </div>

      {/* ── Header — glass, real logo, true-centered title ── */}
      <div style={styles.header}>
        <div
          onMouseDown={handleCornerPressStart} onMouseUp={handleCornerPressEnd}
          onMouseLeave={handleCornerPressEnd} onTouchStart={handleCornerPressStart}
          onTouchEnd={handleCornerPressEnd} style={styles.logoBox}
        >
          <img src={icctLogo} alt="ICCT Colleges" style={styles.logoImg}/>
        </div>
        <div style={styles.kioskName}>
          <div style={styles.kioskTextBlock}>
            <span style={styles.kioskTitle}>Smart Campus Navigator</span>
            <span style={styles.kioskSub}>ICCT Colleges · Cainta, Rizal</span>
          </div>
        </div>
        <div style={styles.dateTime}>
          <span style={styles.timeText}>{formatTime(time)}</span>
          <span style={styles.timeDivider}>|</span>
          <span style={styles.dateText}>{formatDate(time)}</span>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={styles.main} onClick={handleOutsideClick}>
        <div style={styles.topSection}>
          <div style={styles.headingBlock}>
            <h1 style={styles.heading}>Where would you like to go?</h1>
          </div>

          {/* Search bar — glass */}
          <div
            style={{ ...styles.searchBox, ...(isSearching ? styles.searchBoxActive : {}) }}
            onClick={(e) => { e.stopPropagation(); setIsSearching(true) }}
          >
            <span style={{ color: '#7fa8bd', display: 'flex', alignItems: 'center' }}><Icon.Search size={22}/></span>
            <span style={{ flex: 1, fontSize: '20px', color: search ? 'white' : '#7fa8bd', fontFamily: "'Inter',sans-serif" }}>
              {search || 'Tap here to search for a location...'}
            </span>
            {search.length > 0 && (
              <button onMouseDown={(e) => { e.preventDefault(); handleClear() }} style={styles.clearBtn}><Icon.Close size={18}/></button>
            )}
          </div>

          {/* Dropdown — glass */}
          {isSearching && (
            <div style={styles.dropdown} onClick={(e) => e.stopPropagation()}>
              {recommendations.length > 0 ? (
                <div style={styles.dropSection}>
                  <p style={styles.dropLabel}><Icon.Pin size={13}/> Suggestions</p>
                  <div style={styles.chipRow}>
                    {recommendations.map((r) => (
                      <button key={r} onMouseDown={(e) => { e.preventDefault(); handleSearch(r) }} style={styles.recoChip}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div style={styles.dropSection}>
                    <p style={styles.dropLabel}><Icon.Flame size={13}/> Popular Locations</p>
                    <div style={styles.chipRow}>
                      {POPULAR.map((place) => (
                        <button key={place} onMouseDown={(e) => { e.preventDefault(); handleSearch(place) }} style={styles.chip}>{place}</button>
                      ))}
                    </div>
                  </div>
                  <div style={styles.dropSection}>
                    <p style={styles.dropLabel}><Icon.Tag size={13}/> Categories</p>
                    <div style={styles.chipRow}>
                      {CATEGORIES.map((cat) => (
                        <button key={cat} onMouseDown={(e) => { e.preventDefault(); handleSearch(cat) }} style={{ ...styles.chip, ...styles.chipCat }}>{cat}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Persistent search pill */}
          {!isSearching && search.length > 0 && (
            <div style={styles.persistRow}>
              <span style={styles.persistLabel}>Searching for:</span>
              <span style={styles.persistPill}>{search}</span>
              <button onMouseDown={(e) => { e.preventDefault(); handleClear() }} style={styles.persistClear}>Clear</button>
            </div>
          )}
        </div>

        {/* ── Building Cards ── */}
        {!isSearching && (
          <div style={styles.cardsSection} onClick={(e) => e.stopPropagation()}>
            <p style={styles.cardsLabel}><Icon.Pin size={14}/> Browse by Building</p>
            <div style={styles.cardsGrid}>
              {BUILDINGS.map(b => (
                <BuildingCard key={b.id} building={b} />
              ))}
            </div>
          </div>
        )}

        {/* ── Virtual Keyboard — glass ── */}
        {isSearching && (
          <div style={styles.keyboard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.keyRow}>
              {NUMBER_ROW.map((num) => (
                <button key={num} onMouseDown={(e) => { e.preventDefault(); handleNumber(num) }} style={styles.key}>{num}</button>
              ))}
            </div>
            {KEYBOARD_ROWS.map((row, i) => (
              <div key={i} style={styles.keyRow}>
                {row.map((key) => (
                  <button key={key} onMouseDown={(e) => { e.preventDefault(); handleKey(key) }} style={styles.key}>
                    {capsOn ? key.toUpperCase() : key.toLowerCase()}
                  </button>
                ))}
              </div>
            ))}
            <div style={styles.keyRow}>
              <button onMouseDown={(e) => { e.preventDefault(); setCapsOn(p => !p) }}
                style={{ ...styles.key, ...styles.keyCaps, ...(capsOn ? styles.keyCapsActive : {}) }}>
                {capsOn ? '⬆ ABC' : '⬆ abc'}
              </button>
              <button onMouseDown={handleBackspaceDown} onMouseUp={handleBackspaceUp}
                onMouseLeave={handleBackspaceUp} onTouchStart={handleBackspaceDown} onTouchEnd={handleBackspaceUp}
                style={{ ...styles.key, ...styles.keyWide }}>⌫</button>
              <button onMouseDown={(e) => { e.preventDefault(); handleKey(' ') }}
                style={{ ...styles.key, ...styles.keySpace }}>SPACE</button>
              <button onMouseDown={(e) => { e.preventDefault(); if (search.trim()) handleSearch(search.trim()) }}
                style={{ ...styles.key, ...styles.keySearch, ...(search.trim() ? {} : styles.keySearchDisabled) }}>
                SEARCH
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    background: 'linear-gradient(135deg, #040816 0%, #07182E 50%, #04111D 100%)',
    height: '100vh', width: '100%', color: 'white', display: 'flex', flexDirection: 'column',
    overflow: 'hidden', position: 'relative', fontFamily: "'Inter',system-ui,sans-serif",
  },

  ambientWrap: { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' },
  campusBg: {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: 'cover', opacity: 0.16, filter: 'saturate(0.7) brightness(0.8)',
  },
  campusOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(4,8,22,0.88) 0%, rgba(7,24,46,0.82) 50%, rgba(4,17,29,0.92) 100%)',
  },
  ambient1: { position: 'absolute', width: '480px', height: '480px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,141,239,0.10) 0%, transparent 70%)', top: '-12%', left: '-6%', filter: 'blur(60px)' },
  ambient2: { position: 'absolute', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,124,240,0.08) 0%, transparent 70%)', bottom: '-12%', right: '8%', filter: 'blur(65px)' },
  ambient3: { position: 'absolute', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)', top: '35%', right: '25%', filter: 'blur(70px)' },

  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 28px',
    background: 'rgba(7,24,46,0.55)',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    flexShrink: 0, position: 'relative', zIndex: 2,
  },
  logoBox: { cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' },
  logoImg: { height: '72px', width: 'auto', display: 'block', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' },
  kioskName: { display: 'flex', flexDirection: 'row', alignItems: 'center', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' },
  kioskTextBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  kioskTitle: { fontSize: '24px', fontWeight: '700', color: 'white', fontFamily: "'Inter',sans-serif", letterSpacing: '-0.3px' },
  kioskSub:   { fontSize: '12px', color: '#7fa8bd', marginTop: '2px', fontFamily: "'Inter',sans-serif", letterSpacing: '0.3px' },
  dateTime:   { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px' },
  timeText:   { fontSize: '26px', fontWeight: '600', color: '#7C9CF0', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.5px', fontFamily: "'Inter',sans-serif" },
  timeDivider:{ fontSize: '18px', color: 'rgba(255,255,255,0.15)', fontWeight: '300' },
  dateText:   { fontSize: '16px', color: '#7fa8bd', fontWeight: '400', fontFamily: "'Inter',sans-serif" },

  main: { flex: 1, display: 'flex', flexDirection: 'column', padding: '1.25rem', overflow: 'hidden', gap: '10px', position: 'relative', zIndex: 1 },
  topSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' },
  heading: { fontSize: '48px', fontWeight: '600', textAlign: 'center', margin: 10, fontFamily: "'Inter',sans-serif", letterSpacing: '-1px' },
  headingBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0.3rem', marginBottom: '0.5rem' },

  searchBox: {
    display: 'flex', alignItems: 'center',
    background: 'rgba(10,25,42,0.5)',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '50px', padding: '16px 28px', gap: '14px',
    width: '100%', maxWidth: '960px', cursor: 'pointer',
    marginBottom: '0.75rem', minHeight: '64px',
    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  searchBoxActive: { border: '1px solid rgba(124,124,240,0.6)', background: 'rgba(10,25,42,0.7)', boxShadow: '0 8px 32px rgba(124,124,240,0.15), inset 0 1px 0 rgba(255,255,255,0.05)' },
  clearBtn: { background: 'transparent', border: 'none', color: '#7fa8bd', cursor: 'pointer', padding: '4px 8px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  persistRow:   { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' },
  persistLabel: { fontSize: '13px', color: '#7fa8bd', fontFamily: "'Inter',sans-serif" },
  persistPill:  { background: 'rgba(124,124,240,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(124,124,240,0.5)', borderRadius: '20px', padding: '4px 16px', fontSize: '15px', color: '#9B9BF5', fontFamily: "'Inter',sans-serif" },
  persistClear: { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '4px 12px', fontSize: '13px', color: '#7fa8bd', cursor: 'pointer', fontFamily: "'Inter',sans-serif" },

  dropdown: {
    width: '100%', maxWidth: '960px',
    background: 'rgba(7,18,32,0.65)',
    backdropFilter: 'blur(28px) saturate(160%)',
    WebkitBackdropFilter: 'blur(28px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px', padding: '1rem 1.25rem', marginTop: '4px',
    boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
  },
  dropSection: { marginBottom: '0.75rem' },
  dropLabel: { fontSize: '13px', color: '#7fa8bd', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  chip: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '10px 20px', color: '#c8e0eb', fontSize: '17px', cursor: 'pointer', minHeight: '44px', fontFamily: "'Inter',sans-serif" },
  chipCat:  { background: 'rgba(91,141,239,0.12)', border: '1px solid rgba(91,141,239,0.3)', color: '#9B9BF5' },
  recoChip: { background: 'rgba(124,124,240,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(124,124,240,0.4)', borderRadius: '24px', padding: '10px 20px', color: '#9B9BF5', fontSize: '17px', cursor: 'pointer', minHeight: '44px', fontFamily: "'Inter',sans-serif" },

  cardsSection: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0, paddingTop: '0.25rem' },
  cardsLabel: { fontSize: '13px', letterSpacing: '2px', color: '#7fa8bd', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", fontWeight: '700', marginBottom: '20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', width: '100%', flex: 1, minHeight: 0, maxHeight: '480px' },

  keyboard: {
    width: '100%',
    background: 'rgba(7,18,32,0.55)',
    backdropFilter: 'blur(22px) saturate(160%)',
    WebkitBackdropFilter: 'blur(22px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px', padding: '0.85rem 1rem', flexShrink: 0, marginTop: 'auto',
    boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
  },
  keyRow: { display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '6px' },
  key: {
    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', color: 'white',
    fontSize: '23px', fontWeight: '600', padding: '16px 0', flex: 1, maxWidth: '180px',
    cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'background 0.08s, transform 0.08s',
    minHeight: '80px',
  },
  keyCaps:        { maxWidth: '106px', color: '#7fa8bd' },
  keyCapsActive:  { background: 'rgba(124,124,240,0.25)', border: '1px solid rgba(124,124,240,0.5)', color: '#9B9BF5' },
  keyWide:        { maxWidth: '106px' },
  keySpace:       { maxWidth: '340px' },
  keySearch:      { maxWidth: '150px', background: 'linear-gradient(135deg, #5B8DEF, #A78BFA)', border: 'none', color: '#04141f', fontWeight: '700', backdropFilter: 'none' },
  keySearchDisabled: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#5a7a8a', cursor: 'not-allowed' },
}
