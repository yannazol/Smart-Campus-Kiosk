import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FLOOR_BLOCKS, FLOOR_LABELS } from '../../data/campusData'

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

// ── Building config ────────────────────────────────────────────
const BUILDINGS = [
  { id: 'Building 1', short: 'B1', color: '#378add', glow: 'rgba(55,138,221,0.3)',  icon: '🏛️', floors: [1,2,3,4] },
  { id: 'Building 2', short: 'B2', color: '#1d9e75', glow: 'rgba(29,158,117,0.3)', icon: '💻', floors: [1,2,3,4] },
  { id: 'Building 3', short: 'B3', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)', icon: '🏫', floors: [1,2,3,4] },
  { id: 'Building 4', short: 'B4', color: '#a78bfa', glow: 'rgba(167,139,250,0.3)',icon: '🔬', floors: [1,2,3,4] },
]

// ── Building name → viewbox region ────────────────────────────
// Each building occupies a quadrant in the 22x22 grid
const BUILDING_VIEWBOX = {
  'Building 1': { x: 11.5, y: 11, w: 10, h: 10 }, // bottom-right
  'Building 2': { x: 11.5, y: 0,  w: 10, h: 10 }, // top-right
  'Building 3': { x: 0.5,  y: 11, w: 10, h: 10 }, // bottom-left
  'Building 4': { x: 0.5,  y: 0,  w: 10, h: 10 }, // top-left
}

// ── Mini Building Map ──────────────────────────────────────────
function MiniBuildingMap({ buildingName, floor, color }) {
  const blocks = FLOOR_BLOCKS[floor] || FLOOR_BLOCKS[1]
  const region = BUILDING_VIEWBOX[buildingName]
  if (!region) return null

  // SVG canvas size
  const W = 260, H = 200
  const PAD = 8

  // Scale: map region coords → SVG pixels
  const sx = x => PAD + ((x - region.x) / region.w) * (W - PAD * 2)
  const sy = y => PAD + ((y - region.y) / region.h) * (H - PAD * 2)

  // Only blocks that belong to this building
  const buildingBlocks = blocks.filter(b => {
    if (b.label === buildingName) return true // the outline itself
    if (b.type === 'building' || b.type === 'hallway') return false
    // Check if block overlaps with this building's region
    const bRight  = b.x + b.w
    const bBottom = b.y + b.h
    const rRight  = region.x + region.w
    const rBottom = region.y + region.h
    return (
      b.x < rRight && bRight > region.x &&
      b.y < rBottom && bBottom > region.y
    )
  })

  // Fill colors per type
  const typeFill = {
    office:   '#0d2040',
    lab:      '#0d2535',
    facility: '#0a1a2e',
    stairs:   '#162d55',
    elevator: '#1a3a6e',
    hallway:  '#080f1e',
    building: '#0a1628',
  }

  // Label helper
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
      if (test.length > charsPerLine && cur) { lines.push(cur); cur = w }
      else cur = test
    }
    if (cur) lines.push(cur)
    return { lines: lines.slice(0, maxLines), fontSize, lineH: fontSize + 2.5 }
  }

  return (
    <svg
      width="100%" height="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', background: '#070d1a', borderRadius: 8 }}
    >
      {/* Building outline */}
      <rect
        x={PAD} y={PAD}
        width={W - PAD * 2} height={H - PAD * 2}
        rx="4"
        fill="#0a1628"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Room blocks */}
      {buildingBlocks.filter(b => b.label !== buildingName).map((b, i) => {
        const bx = sx(b.x), by = sy(b.y)
        const bw = sx(b.x + b.w) - sx(b.x)
        const bh = sy(b.y + b.h) - sy(b.y)
        if (bw < 2 || bh < 2) return null
        const fill = typeFill[b.type] || '#0d1b2e'
        const stroke = b.type === 'stairs' ? color + '88'
          : b.type === 'elevator' ? color
          : '#1a3a5c'
        const cx = bx + bw / 2
        const cy = by + bh / 2
        const { lines, fontSize, lineH } = roomLabel(b.label, bw, bh)
        const totalH = lines.length * lineH
        const startY = cy - totalH / 2 + lineH / 2

        return (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={bh} rx="2"
              fill={fill} stroke={stroke} strokeWidth="0.8" opacity="0.95"
            />
            {bw > 14 && bh > 8 && lines.map((line, li) => (
              <text key={li}
                x={cx} y={startY + li * lineH}
                textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize, fill: '#3a6a8e', fontFamily: 'monospace', pointerEvents: 'none', userSelect: 'none' }}
              >
                {line}
              </text>
            ))}
          </g>
        )
      })}

      {/* Building label watermark */}
      <text
        x={W / 2} y={H / 2}
        textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 48, fill: color, fontFamily: 'monospace', fontWeight: 700, opacity: 0.06, pointerEvents: 'none', userSelect: 'none' }}
      >
        {buildingName.replace('Building ', 'B')}
      </text>

      {/* Floor label */}
      <text
        x={W - PAD - 2} y={H - PAD - 2}
        textAnchor="end" dominantBaseline="auto"
        style={{ fontSize: 8, fill: color, fontFamily: 'monospace', fontWeight: 700, opacity: 0.7 }}
      >
        {FLOOR_LABELS[floor] || `Floor ${floor}`}
      </text>
    </svg>
  )
}

// ── Flip Card ──────────────────────────────────────────────────
function BuildingCard({ building }) {
  const [flipped, setFlipped] = useState(false)
  const [activeFloor, setActiveFloor] = useState(1)

  return (
    <div
      style={{ width: '100%', height: '100%', perspective: '1000px', cursor: 'pointer' }}
      onClick={() => setFlipped(f => !f)}
    >
      {/* Inject backface CSS once */}
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
          border-radius: 18px;
          overflow: hidden;
        }
        .card-back { transform: rotateY(180deg); }
      `}</style>

      <div className={`card-inner${flipped ? ' flipped' : ''}`}>

        {/* ── Front ── */}
        <div className="card-face" style={{
          background: '#0f2040',
          border: `1px solid ${building.color}44`,
          boxShadow: `0 0 28px ${building.glow}`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Top color accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: building.color, borderRadius: '18px 18px 0 0' }} />
          {/* Subtle glow bg */}
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 60%, ${building.color}10 0%, transparent 70%)`, pointerEvents: 'none' }} />

          <div style={{ fontSize: '44px', lineHeight: 1, marginBottom: '14px', position: 'relative' }}>{building.icon}</div>
          <div style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '3px', fontFamily: 'monospace', color: building.color, lineHeight: 1, marginBottom: '8px', position: 'relative' }}>{building.short}</div>
          <div style={{ fontSize: '14px', color: '#4a7fb5', fontWeight: '500', marginBottom: '20px', position: 'relative' }}>{building.id}</div>
          <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'monospace', color: building.color + '99', position: 'relative' }}>Tap to see map</div>
        </div>

        {/* ── Back ── */}
          <div className="card-face card-back" style={{
          background: '#0a1628',
          border: `1px solid ${building.color}55`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',}}
>
          {/* Top color accent */}
          <div style={{ height: '4px', background: building.color, borderRadius: '18px 18px 0 0', flexShrink: 0 }} />

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px 8px', borderBottom: `1px solid ${building.color}22`, flexShrink: 0,
          }}>
            <span style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '1px', fontFamily: 'monospace', color: building.color }}>{building.id}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {building.floors.map(f => (
                <button key={f}
                  onClick={e => { e.stopPropagation(); setActiveFloor(f) }}
                  style={{
                    background: activeFloor === f ? building.color : 'transparent',
                    border: `1px solid ${activeFloor === f ? building.color : '#1e3a5f'}`,
                    borderRadius: '6px',
                    color: activeFloor === f ? '#fff' : '#4a7fb5',
                    fontSize: '10px', fontWeight: '700',
                    padding: '3px 7px', cursor: 'pointer',
                    fontFamily: 'monospace', transition: 'all 0.15s',
                  }}
                >
                  {f === 1 ? 'GF' : `${f}F`}
                </button>
              ))}
            </div>
          </div>

          {/* Mini map */}
          <div style={{ flex: 1, padding: '8px', minHeight: 0, overflow: 'hidden' }}>
            <MiniBuildingMap buildingName={building.id} floor={activeFloor} color={building.color} />
          </div>

          {/* Flip back hint */}
          <div style={{
            textAlign: 'center', padding: '5px 0 8px',
            fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase',
            fontFamily: 'monospace', color: building.color + '66', flexShrink: 0,
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

      {/* ── Header ── */}
      <div style={styles.header}>
        <div
          onMouseDown={handleCornerPressStart} onMouseUp={handleCornerPressEnd}
          onMouseLeave={handleCornerPressEnd} onTouchStart={handleCornerPressStart}
          onTouchEnd={handleCornerPressEnd} style={styles.logoBox}
        >
          <div style={styles.logoPlaceholder}>ICCT</div>
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

          {/* Search bar */}
          <div
            style={{ ...styles.searchBox, ...(isSearching ? styles.searchBoxActive : {}) }}
            onClick={(e) => { e.stopPropagation(); setIsSearching(true) }}
          >
            <span style={styles.searchIcon}>🔍</span>
            <span style={{ flex: 1, fontSize: '20px', color: search ? 'white' : '#4a7fb5' }}>
              {search || 'Tap here to search for a location...'}
            </span>
            {search.length > 0 && (
              <button onMouseDown={(e) => { e.preventDefault(); handleClear() }} style={styles.clearBtn}>✕</button>
            )}
          </div>

          {/* Dropdown */}
          {isSearching && (
            <div style={styles.dropdown} onClick={(e) => e.stopPropagation()}>
              {recommendations.length > 0 ? (
                <div style={styles.dropSection}>
                  <p style={styles.dropLabel}>📍 Suggestions</p>
                  <div style={styles.chipRow}>
                    {recommendations.map((r) => (
                      <button key={r} onMouseDown={(e) => { e.preventDefault(); handleSearch(r) }} style={styles.recoChip}>
                        🔍 {r}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div style={styles.dropSection}>
                    <p style={styles.dropLabel}>🔥 Popular Locations</p>
                    <div style={styles.chipRow}>
                      {POPULAR.map((place) => (
                        <button key={place} onMouseDown={(e) => { e.preventDefault(); handleSearch(place) }} style={styles.chip}>{place}</button>
                      ))}
                    </div>
                  </div>
                  <div style={styles.dropSection}>
                    <p style={styles.dropLabel}>🏷️ Categories</p>
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
              <button onMouseDown={(e) => { e.preventDefault(); handleClear() }} style={styles.persistClear}>✕ Clear</button>
            </div>
          )}
        </div>

        {/* ── Building Cards — only when not searching ── */}
        {!isSearching && (
          <div style={styles.cardsSection} onClick={(e) => e.stopPropagation()}>
            <p style={styles.cardsLabel}>📍 Browse by Building</p>
            <div style={styles.cardsGrid}>
              {BUILDINGS.map(b => (
                <BuildingCard key={b.id} building={b} />
              ))}
            </div>
          </div>
        )}

        {/* ── Virtual Keyboard ── */}
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
  page: { background: '#0a1628', height: '100vh', width: '100%', color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #1e3a5f', background: '#0f2040', flexShrink: 0 },
  logoBox: { cursor: 'pointer', userSelect: 'none' },
  logoPlaceholder: { background: '#378add', color: 'white', fontWeight: '700', fontSize: '22px', padding: '10px 18px', borderRadius: '10px', letterSpacing: '2px' },
  kioskName: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
  kioskTextBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  kioskTitle: { fontSize: '26px', fontWeight: '700', color: 'white' },
  kioskSub:   { fontSize: '13px', color: '#4a7fb5', marginTop: '2px' },
  dateTime:   { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' },
  timeText:   { fontSize: '23px', fontWeight: '550', color: '#6eb6ff', fontVariantNumeric: 'tabular-nums', letterSpacing: '1px' },
  timeDivider:{ fontSize: '22px', color: '#1e3a5f', fontWeight: '300' },
  dateText:   { fontSize: '20px', color: '#8ab4d8', fontWeight: '400' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', padding: '1.25rem', overflow: 'hidden', gap: '10px' },
  topSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' },
  heading: { fontSize: '60px', fontWeight: '300', textAlign: 'center', margin: 10 },
  headingBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0.3rem', marginBottom: '0.5rem' },
  searchBox: { display: 'flex', alignItems: 'center', background: '#0f2040', border: '2px solid #1e3a5f', borderRadius: '50px', padding: '16px 28px', gap: '14px', width: '100%', maxWidth: '960px', cursor: 'pointer', marginBottom: '0.75rem', minHeight: '64px', transition: 'border-color 0.2s' },
  searchBoxActive: { border: '2px solid #378add' },
  searchIcon: { fontSize: '22px' },
  clearBtn: { background: 'transparent', border: 'none', color: '#4a7fb5', fontSize: '20px', cursor: 'pointer', padding: '4px 8px', minWidth: '44px', minHeight: '44px' },
  persistRow:   { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' },
  persistLabel: { fontSize: '13px', color: '#4a7fb5' },
  persistPill:  { background: '#162d55', border: '1px solid #378add', borderRadius: '20px', padding: '4px 16px', fontSize: '15px', color: '#6eb6ff' },
  persistClear: { background: 'transparent', border: '1px solid #1e3a5f', borderRadius: '20px', padding: '4px 12px', fontSize: '13px', color: '#4a7fb5', cursor: 'pointer' },
  dropdown: { width: '100%', maxWidth: '960px', background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: '16px', padding: '1rem 1.25rem', marginBottom: '0.5rem' },
  dropSection: { marginBottom: '0.75rem' },
  dropLabel: { fontSize: '13px', color: '#4a7fb5', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  chip: { background: '#162d55', border: '1px solid #1e3a5f', borderRadius: '24px', padding: '10px 20px', color: '#c8ddf5', fontSize: '17px', cursor: 'pointer', minHeight: '44px' },
  chipCat:  { background: '#0c2d5a', color: '#6eb6ff' },
  recoChip: { background: '#0c3825', border: '1px solid #1d9e75', borderRadius: '24px', padding: '10px 20px', color: '#3dcaa5', fontSize: '17px', cursor: 'pointer', minHeight: '44px' },
  // Cards
  cardsSection: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, paddingTop: '5rem' },
  cardsLabel: { fontSize: '25px', letterSpacing: '2px', color: '#4a7fb5', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: '20px', textAlign: 'center' },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', width: '100%', flex: 1, minHeight: 0, maxHeight: '680px' },
  // Keyboard
  keyboard: { width: '100%', background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: '16px', padding: '0.85rem 1rem', flexShrink: 0, marginTop: 'auto' },
  keyRow: { display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '6px' },
  key: { background: '#162d55', border: '1px solid #1e3a5f', borderRadius: '20px', color: 'white', fontSize: '23px', fontWeight: '600', padding: '16px 0', flex: 1, maxWidth: '180px', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.08s, transform 0.08s', minHeight: '80px' },
  keyCaps:        { maxWidth: '106px', color: '#4a7fb5' },
  keyCapsActive:  { background: '#1e3a5f', color: '#6eb6ff' },
  keyWide:        { maxWidth: '106px' },
  keySpace:       { maxWidth: '340px' },
  keySearch:      { maxWidth: '150px', background: '#378add', border: '1px solid #378add', color: 'white' },
  keySearchDisabled: { background: '#1e3a5f', border: '1px solid #1e3a5f', color: '#4a7fb5', cursor: 'not-allowed' },
}
