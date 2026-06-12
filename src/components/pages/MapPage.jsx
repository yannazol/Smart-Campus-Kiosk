import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  LOCATIONS, EDGES, FLOOR_BLOCKS, FLOOR_LABELS,
  TYPE_META, KIOSK_NODE_ID, SCALE,
  sx, sy, findLocationByName, fetchNavigation,
} from '../../data/campusData'

// ─────────────────────────────────────────────────────────────
//  QR CODE
// ─────────────────────────────────────────────────────────────
function makeQR(text, size = 21) {
  const seed = text.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7)
  return Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => {
      if (r < 7 && c < 7) return (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4))
      if (r < 7 && c > size - 8) return (r === 0 || r === 6 || c === size - 1 || c === size - 7 || (r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3))
      if (r > size - 8 && c < 7) return (r === size - 1 || r === size - 7 || c === 0 || c === 6 || (r >= size - 5 && r <= size - 3 && c >= 2 && c <= 4))
      return ((seed * (r + 1) * (c + 3) + r * 7 + c * 13) % 5) < 2
    })
  )
}

function QRCode({ value, size = 80 }) {
  const grid = useMemo(() => makeQR(String(value)), [value])
  const cell = size / grid.length
  return (
    <svg width={size} height={size}
      style={{ background: 'white', borderRadius: 6, display: 'block', flexShrink: 0 }}>
      {grid.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c*cell} y={r*cell} width={cell} height={cell} fill="#111"/> : null
        )
      )}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
//  ROOM PHOTO PLACEHOLDER
//  Replace src with real image URL when photos are available
//  Tip: add image_url field to MySQL locations table
// ─────────────────────────────────────────────────────────────
function RoomPhoto({ location }) {
  const [imgError, setImgError] = useState(false)

  // If location has a real image_url from backend, use it
  // Otherwise show a styled placeholder
  const hasImage = location?.image_url && !imgError

  return (
    <div style={ps.wrap}>
      {hasImage ? (
        <img
          src={location.image_url}
          alt={location.name}
          style={ps.img}
          onError={() => setImgError(true)}
        />
      ) : (
        <div style={ps.placeholder}>
          <div style={ps.placeholderIcon}>🏫</div>
          <p style={ps.placeholderName}>{location?.name}</p>
          <p style={ps.placeholderSub}>
            {location?.type === 'library'    ? 'Reference books & reading area'   :
             location?.type === 'laboratory' ? 'Computer & equipment room'        :
             location?.type === 'office'     ? 'Administrative office'            :
             location?.type === 'clinic'     ? 'Medical & first aid services'     :
             location?.type === 'lounge'     ? 'Visitor & student lounge area'    :
             'Campus room & facility'}
          </p>
          <p style={ps.placeholderNote}>📷 Photo coming soon</p>
        </div>
      )}
    </div>
  )
}

const ps = {
  wrap: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid #1e3a5f',
    background: '#0d1b2e',
  },
  img: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
    display: 'block',
  },
  placeholder: {
    height: '140px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    background: 'linear-gradient(135deg, #0d1b2e 0%, #0f2040 100%)',
    padding: '12px',
  },
  placeholderIcon:  { fontSize: 28, marginBottom: 4 },
  placeholderName:  { fontSize: 12, fontWeight: 600, color: '#6eb6ff', textAlign: 'center' },
  placeholderSub:   { fontSize: 10, color: '#4a7fb5', textAlign: 'center', lineHeight: 1.4 },
  placeholderNote:  { fontSize: 9,  color: '#1e3a5f', marginTop: 4 },
}

// ─────────────────────────────────────────────────────────────
//  CAMPUS SVG MAP
// ─────────────────────────────────────────────────────────────

const BLDG_LABELS = {
  'Building 1': { short: 'B1', color: '#378add' },
  'Building 2': { short: 'B2', color: '#1d9e75' },
  'Building 3': { short: 'B3', color: '#f59e0b' },
  'Building 4': { short: 'B4', color: '#a78bfa' },
}

// Types that should never show as clickable nodes
const HIDDEN_NODE_TYPES = new Set(['hallway'])

function roomLabel(label, bw, bh) {
  if (!label || typeof label !== 'string' || label.trim() === '') return { lines: [], fontSize: 6, lineH: 8 }
  const fontSize = Math.max(5, Math.min(7.5, bw / 12))
  const charsPerLine = Math.max(5, Math.floor(bw / (fontSize * 0.6)))
  const maxLines = Math.max(1, Math.floor(bh / (fontSize + 3)))
  const words = label.split(' ')
  const lines = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (test.length > charsPerLine && cur) { lines.push(cur); cur = w }
    else cur = test
  }
  if (cur) lines.push(cur)
  const visible = lines.slice(0, maxLines)
  return { lines: visible, fontSize, lineH: fontSize + 2.5 }
}

function CampusMap({ floor, destId, path }) {
  const blocks    = FLOOR_BLOCKS[floor] || FLOOR_BLOCKS[1]
  const floorLocs = LOCATIONS.filter(l => l.floor === floor)

  const pathSet = useMemo(() => {
    const s = new Set()
    for (let i = 0; i < path.length - 1; i++) {
      s.add(`${path[i]}-${path[i+1]}`)
      s.add(`${path[i+1]}-${path[i]}`)
    }
    return s
  }, [path])

  // Only show kiosk + destination + path nodes (no hallways, no random clicks)
  const visibleNodes = floorLocs.filter(l =>
    !HIDDEN_NODE_TYPES.has(l.type) && (
      l.id === KIOSK_NODE_ID ||
      l.id === destId ||
      path.includes(l.id)
    )
  )

  return (
    <svg
      viewBox={`0 0 ${SCALE.W} ${SCALE.H}`}
      width="100%" height="100%"
      style={{ background: '#070d1a', borderRadius: 10, border: '1px solid #1a2744', display: 'block' }}
    >
      {/* ── PASS 1: Building outlines ── */}
      {blocks.filter(b => b.type === 'building').map((b, i) => {
        const bx = sx(b.x), by = sy(b.y)
        const bw = sx(b.x + b.w) - sx(b.x)
        const bh = sy(b.y + b.h) - sy(b.y)
        const info = BLDG_LABELS[b.label]
        return (
          <rect key={`bldg-${i}`}
            x={bx} y={by} width={bw} height={bh} rx="4"
            fill="#0d1b2e"
            stroke={info?.color || '#1a3a5c'}
            strokeWidth="2"
          />
        )
      })}

      {/* ── PASS 2: Room blocks ── */}
      {blocks.filter(b => b.type !== 'building').map((b, i) => {
        const bx = sx(b.x), by = sy(b.y)
        const bw = sx(b.x + b.w) - sx(b.x)
        const bh = sy(b.y + b.h) - sy(b.y)
        const meta = TYPE_META[b.type] || TYPE_META.facility
        const cx = bx + bw / 2
        const cy = by + bh / 2
        const result = roomLabel(b.label, bw, bh)
        const { lines, fontSize, lineH } = result
        const totalH = lines.length * lineH
        const startY = cy - totalH / 2 + lineH / 2

        return (
          <g key={`room-${i}`}>
            <rect x={bx} y={by} width={bw} height={bh} rx="3"
              fill={meta.fill || '#0d1b2e'}
              stroke="#1a3a5c" strokeWidth="1" opacity="0.9"
            />
            {bw > 20 && bh > 10 && lines.map((line, li) => (
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

      {/* ── PASS 3: Building labels — centered, always on top ── */}
      {blocks.filter(b => b.type === 'building').map((b, i) => {
        const bx = sx(b.x), by = sy(b.y)
        const bw = sx(b.x + b.w) - sx(b.x)
        const bh = sy(b.y + b.h) - sy(b.y)
        const cx = bx + bw / 2   // ← CENTER of building box
        const cy = by + bh / 2   // ← CENTER of building box
        const info = BLDG_LABELS[b.label]
        if (!info) return null
        const fs = Math.min(bw / 5, bh / 3, 36)
        return (
          <g key={`blbl-${i}`} style={{ pointerEvents: 'none' }}>
            {/* Subtle background pill */}
            <rect
              x={cx - fs * 0.9} y={cy - fs * 0.65}
              width={fs * 1.8} height={fs * 1.2}
              rx="8"
              fill={info.color} opacity="0.12"
            />
            {/* Big centered label */}
            <text
              x={cx} y={cy}
              textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: fs, fill: info.color, fontFamily: 'monospace', fontWeight: 700, opacity: 0.75 }}
            >
              {info.short}
            </text>
          </g>
        )
      })}

      {/* ── Floor label ── */}
      <text x={sx(11)} y={sy(22.5)} textAnchor="middle"
        style={{ fontSize: 11, fill: '#1e3a5f', fontFamily: 'monospace', fontWeight: 700 }}>
        {FLOOR_LABELS[floor] || `Floor ${floor}`}
      </text>

      {/* ── Edges (active path highlighted) ── */}
      {EDGES.map(([a, b], i) => {
        const la = floorLocs.find(l => l.id === a)
        const lb = floorLocs.find(l => l.id === b)
        if (!la || !lb) return null
        const active = pathSet.has(`${a}-${b}`)
        return (
          <path key={i}
            d={`M${sx(la.x)},${sy(la.y)} L${sx(lb.x)},${sy(lb.y)}`}
            stroke={active ? '#38bdf8' : '#1a3a5c'}
            strokeWidth={active ? 2.5 : 1}
            strokeLinecap="round"
            strokeDasharray={active ? 'none' : '4,3'}
            fill="none"
            opacity={active ? 1 : 0.3}
          />
        )
      })}

      {/* ── Animated dot on active path ── */}
      {path.length > 1 && (() => {
        const pathD = path.reduce((d, id, i) => {
          const loc = floorLocs.find(l => l.id === id)
          if (!loc) return d
          return d + (i === 0 ? `M${sx(loc.x)},${sy(loc.y)}` : ` L${sx(loc.x)},${sy(loc.y)}`)
        }, '')
        if (!pathD || pathD.length < 4) return null
        return (
          <g>
            <path id="anim-path" d={pathD} fill="none" stroke="none"/>
            <circle r="5" fill="#38bdf8" opacity="0.9">
              <animateMotion dur="3s" repeatCount="indefinite">
                <mpath href="#anim-path"/>
              </animateMotion>
            </circle>
          </g>
        )
      })()}

      {/* ── PASS 4: Window & sub-location pill tags — ALWAYS VISIBLE ── */}
      {floorLocs.filter(l =>
        l.type !== 'hallway' &&
        l.id !== KIOSK_NODE_ID &&
        (l.name?.toLowerCase().startsWith('window') ||
         l.type === 'Registrar' ||
         l.type === 'Accounting')
      ).map(loc => {
        const isDest  = loc.id === destId
        const lx = sx(loc.x)
        const ly = sy(loc.y)

        // Short label — "W1", "W2" etc
        const shortLabel = loc.name.toLowerCase().startsWith('window')
          ? 'W' + loc.name.replace(/[^0-9]/g, '')
          : loc.name.slice(0, 4)

        const pillW = 18
        const pillH = 10

        return (
          <g key={`pill-${loc.id}`} style={{ pointerEvents: 'none' }}>
            {/* Pill background */}
            <rect
              x={lx - pillW / 2} y={ly - pillH / 2}
              width={pillW} height={pillH}
              rx="3"
              fill={isDest ? '#378add' : '#162d55'}
              stroke={isDest ? '#6eb6ff' : '#2a4a7f'}
              strokeWidth="0.8"
              opacity="0.92"
            />
            {/* Pill label */}
            <text
              x={lx} y={ly}
              textAnchor="middle" dominantBaseline="middle"
              style={{
                fontSize: 5.5,
                fill: isDest ? '#fff' : '#6eb6ff',
                fontFamily: 'monospace',
                fontWeight: 700,
              }}
            >
              {shortLabel}
            </text>
          </g>
        )
      })}

      {/* ── Nodes: kiosk + destination + path only, NO hallways, NO tapping ── */}
      {visibleNodes.map(loc => {
        const isKiosk = loc.id === KIOSK_NODE_ID
        const isDest  = loc.id === destId
        const meta    = TYPE_META[loc.type] || { color: '#94a3b8' }
        const r       = isKiosk || isDest ? 10 : 7

        return (
          <g key={loc.id}>
            {/* Pulse ring for kiosk and destination */}
            {(isKiosk || isDest) && (
              <circle cx={sx(loc.x)} cy={sy(loc.y)} r={r + 6}
                fill={isKiosk ? '#0ea5e922' : '#378add22'}>
                <animate attributeName="r"
                  values={`${r+4};${r+10};${r+4}`}
                  dur="2s" repeatCount="indefinite"/>
              </circle>
            )}
            {/* Node circle */}
            <circle
              cx={sx(loc.x)} cy={sy(loc.y)} r={r}
              fill={isKiosk ? '#0c2240' : isDest ? '#0d2d4a' : '#0d1b2e'}
              stroke={isKiosk ? '#0ea5e9' : isDest ? '#378add' : meta.color}
              strokeWidth={isKiosk || isDest ? 2.5 : 1.5}
            />
            {/* Icon / ID label */}
            <text x={sx(loc.x)} y={sy(loc.y)}
              textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: 6.5, fill: '#fff', fontFamily: 'monospace', fontWeight: 700, pointerEvents: 'none' }}>
              {isKiosk ? '📍' : isDest ? '🏁' : loc.id}
            </text>
            {/* Name label below — only for kiosk and destination */}
            {(isKiosk || isDest) && (
              <text x={sx(loc.x)} y={sy(loc.y) + r + 8}
                textAnchor="middle"
                style={{ fontSize: 6, fill: isKiosk ? '#0ea5e9' : '#378add', fontFamily: 'monospace', pointerEvents: 'none', fontWeight: 600 }}>
                {loc.name.length > 16 ? loc.name.slice(0, 15) + '…' : loc.name}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
//  MAIN MAP PAGE
// ─────────────────────────────────────────────────────────────
export default function MapPage() {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const destQuery      = searchParams.get('destination') || ''

  const [floor,      setFloor]      = useState(1)
  const [destId,     setDestId]     = useState(null)
  const [path,       setPath]       = useState([])
  const [directions, setDirections] = useState([])
  const [loading,    setLoading]    = useState(false)

  // Find destination from URL param
  const destLoc = useMemo(() => {
    if (!destQuery) return null
    const results = findLocationByName(destQuery)
    return results.length > 0 ? results[0] : null
  }, [destQuery])

  // Auto-select destination when page loads
  useEffect(() => {
    if (destLoc) {
      setDestId(destLoc.id)
      setFloor(destLoc.floor || 1)
    }
  }, [destLoc])

  // Fetch directions when destination changes
  useEffect(() => {
    if (!destId) { setPath([]); setDirections([]); return }
    setLoading(true)
    fetchNavigation(destId)
      .then(data => {
        setPath(data.path || [])
        setDirections(data.directions || [])
      })
      .catch(() => setDirections([{ icon: '⚠️', text: 'Could not load directions.', sub: '' }]))
      .finally(() => setLoading(false))
  }, [destId])

  const dest      = LOCATIONS.find(l => l.id === destId)
  const floorKeys = Object.keys(FLOOR_BLOCKS).map(Number).sort((a, b) => a - b)

  return (
    <div style={s.page}>

      {/* ── Top bar ── */}
      <div style={s.topBar}>
        <button style={s.homeBtn} onClick={() => navigate('/home')}>
          🏠 Home
        </button>

        <div style={s.floorRow}>
          <span style={s.floorLabel}>Floor:</span>
          {floorKeys.map(f => (
            <button key={f}
              style={{ ...s.floorBtn, ...(floor === f ? s.floorBtnActive : {}) }}
              onClick={() => setFloor(f)}
            >
              {FLOOR_LABELS[f]?.replace(' Floor', '') || `F${f}`}
            </button>
          ))}
        </div>

        <div style={s.kioskBadge}>📍 Kiosk · GF · Building 4</div>
      </div>

      {/* ── Body ── */}
      <div style={s.body}>

        {/* ── Map ── */}
        <div style={s.mapWrap}>
          <CampusMap
            floor={floor}
            destId={destId}
            path={path}
          />
        </div>

        {/* ── Side panel ── */}
        <div style={s.panel}>

          {/* 1. Destination */}
          <div style={s.sec}>
            <p style={s.secLabel}>📍 Destination</p>
            {dest ? (
              <>
                <p style={s.destName}>{dest.name}</p>
                <p style={s.destSub}>
                  {FLOOR_LABELS[dest.floor] || `Floor ${dest.floor}`}
                  {dest.building ? ` · Building ${dest.building}` : ''}
                </p>
                {dest.desc && <p style={s.destDesc}>{dest.desc}</p>}
              </>
            ) : (
              <p style={s.muted}>No destination selected.</p>
            )}
          </div>

          {/* 2. Directions */}
          <div style={{ ...s.sec, flex: 1, overflowY: 'auto' }}>
            <p style={s.secLabel}>📋 Directions</p>
            {loading ? (
              <p style={s.muted}>Loading directions...</p>
            ) : directions.length > 0 ? (
              directions.map((step, i) => (
                <div key={i} style={s.step}>
                  <div style={s.stepNum}>{step.icon || i + 1}</div>
                  <div>
                    <p style={s.stepText}>{step.text}</p>
                    {step.sub && <p style={s.stepSub}>{step.sub}</p>}
                  </div>
                </div>
              ))
            ) : (
              <p style={s.muted}>
                {dest
                  ? 'Directions will appear here once the backend is connected.'
                  : 'Select a destination to see directions.'}
              </p>
            )}
          </div>

          {/* 3. Room Photo — after directions */}
          {dest && (
            <div style={s.sec}>
              <p style={s.secLabel}>🖼️ What it looks like</p>
              <RoomPhoto location={dest}/>
            </div>
          )}

          {/* 4. QR Code */}
          {dest && (
            <div style={s.sec}>
              <p style={s.secLabel}>📱 Scan to save on phone</p>
              <div style={s.qrRow}>
                <QRCode value={`ICCT-${dest.id}-${dest.name}`} size={72}/>
                <p style={s.muted}>Scan to save these directions on your phone.</p>
              </div>
            </div>
          )}

          {/* Empty state — no destination */}
          {!dest && (
            <div style={{ ...s.sec, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={s.emptyState}>
                <span style={{ fontSize: 40 }}>🗺️</span>
                <p style={{ ...s.muted, textAlign: 'center', lineHeight: 1.6 }}>
                  Search for a location on the Home page to get directions here.
                </p>
                <button style={s.goHomeBtn} onClick={() => navigate('/home')}>
                  Go to Search
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────
const s = {
  page:    { background:'#0a1628', height:'100vh', width:'100%', color:'white', display:'flex', flexDirection:'column', overflow:'hidden', fontFamily:"'Segoe UI',system-ui,sans-serif" },
  topBar:  { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 20px', background:'#0f2040', borderBottom:'1px solid #1e3a5f', flexShrink:0, gap:12 },
  homeBtn: { background:'#162d55', border:'1px solid #1e3a5f', borderRadius:8, color:'#6eb6ff', fontSize:14, padding:'8px 16px', cursor:'pointer', fontFamily:'inherit', flexShrink:0 },
  floorRow:    { display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' },
  floorLabel:  { fontSize:12, color:'#4a7fb5', marginRight:4, flexShrink:0 },
  floorBtn:    { background:'#162d55', border:'1px solid #1e3a5f', borderRadius:20, color:'#4a7fb5', fontSize:12, padding:'5px 14px', cursor:'pointer', fontFamily:'inherit', transition:'all .15s' },
  floorBtnActive:{ background:'#1e3a5f', border:'1px solid #378add', color:'#6eb6ff' },
  kioskBadge:  { fontSize:12, color:'#f59e0b', background:'#1a1200', border:'1px solid #3a2800', borderRadius:8, padding:'6px 12px', flexShrink:0 },
  body:    { flex:1, display:'grid', gridTemplateColumns:'1fr 300px', overflow:'hidden' },
  mapWrap: { padding:12, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' },
  panel:   { display:'flex', flexDirection:'column', background:'#0f2040', borderLeft:'1px solid #1e3a5f', overflow:'hidden' },
  sec:     { borderBottom:'1px solid #1e3a5f', padding:'12px 14px', flexShrink:0 },
  secLabel:{ fontSize:10, letterSpacing:'1.5px', color:'#4a7fb5', textTransform:'uppercase', marginBottom:6 },
  destName:{ fontSize:15, fontWeight:600, color:'#6eb6ff', marginBottom:3, lineHeight:1.3 },
  destSub: { fontSize:11, color:'#4a7fb5', marginBottom:3 },
  destDesc:{ fontSize:10, color:'#334d66', lineHeight:1.5 },
  muted:   { fontSize:12, color:'#4a7fb5', lineHeight:1.6 },
  step:    { display:'flex', gap:8, alignItems:'flex-start', marginBottom:8 },
  stepNum: { background:'#162d55', border:'1px solid #1e3a5f', borderRadius:'50%', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#6eb6ff', flexShrink:0 },
  stepText:{ fontSize:12, color:'#c8ddf5', lineHeight:1.5, margin:0 },
  stepSub: { fontSize:10, color:'#4a7fb5', margin:0, marginTop:2 },
  qrRow:   { display:'flex', alignItems:'center', gap:12 },
  emptyState:{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:20 },
  goHomeBtn: { background:'#378add', border:'none', borderRadius:10, color:'white', fontSize:14, padding:'10px 24px', cursor:'pointer', fontFamily:'inherit' },
}
