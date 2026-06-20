import { useMemo, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  LOCATIONS, EDGES, FLOOR_BLOCKS, FLOOR_LABELS,
  TYPE_META, SCALE, sx, sy, KIOSK_NODE_ID
} from '../../data/campusData'
import icctLogo from '../../assets/icct-logo.png'

// ── Line icons — matches Home/MapPage/Admin exactly ──────────────
const Icon = {
  Pin: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Map: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  ),
  List: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  Building: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="7" x2="9" y2="7.01"/><line x1="15" y1="7" x2="15" y2="7.01"/>
      <line x1="9" y1="12" x2="9" y2="12.01"/><line x1="15" y1="12" x2="15" y2="12.01"/><path d="M9 22v-4h6v4"/>
    </svg>
  ),
  Walk: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="4" r="2"/><path d="M9 21l2-7-3-2 1-5 4-1 3 3 3 1"/><path d="M10 14l-3 2 1 5"/>
    </svg>
  ),
  ArrowRight: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Stairs: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h4v-4h4v-4h4v-4h4V5"/>
    </svg>
  ),
  Flag: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22V4a1 1 0 0 1 1-1h13.5a.5.5 0 0 1 .4.8L15 9l3.9 5.2a.5.5 0 0 1-.4.8H5"/>
    </svg>
  ),
  Layers: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  Lightbulb: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.7.5 1 1.3 1 2.1V18h6v-1.2c0-.8.3-1.6 1-2.1A7 7 0 0 0 12 2z"/>
    </svg>
  ),
  Expand: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  ),
  Close: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
}

const BLDG_LABELS = {
  'Building 1': { short: 'B1', color: '#5B8DEF' },
  'Building 2': { short: 'B2', color: '#7C7CF0' },
  'Building 3': { short: 'B3', color: '#A78BFA' },
  'Building 4': { short: 'B4', color: '#6EA8FE' },
}

// ── Simple BFS pathfinder — same-floor only (mobile shows one floor, so we
// only need the walkable path among nodes that exist on this floor) ──
function findPath(startId, endId, floorLocIds) {
  if (startId == null || endId == null) return []
  if (startId === endId) return [startId]

  const idSet = new Set(floorLocIds)
  const adj = {}
  EDGES.forEach(([a, b]) => {
    if (!idSet.has(a) || !idSet.has(b)) return
    if (!adj[a]) adj[a] = []
    if (!adj[b]) adj[b] = []
    adj[a].push(b)
    adj[b].push(a)
  })

  const visited = new Set([startId])
  const queue = [[startId]]
  while (queue.length) {
    const path = queue.shift()
    const node = path[path.length - 1]
    if (node === endId) return path
    for (const next of (adj[node] || [])) {
      if (!visited.has(next)) {
        visited.add(next)
        queue.push([...path, next])
      }
    }
  }
  return []
}

function MiniMap({ floor, destId }) {
  const blocks    = FLOOR_BLOCKS[floor] || FLOOR_BLOCKS[1]
  const floorLocs = LOCATIONS.filter(l => l.floor === floor)
  const dest      = floorLocs.find(l => l.id === destId)
  const kiosk     = floorLocs.find(l => l.id === KIOSK_NODE_ID)

  // Route from kiosk to destination, restricted to nodes on this floor
  const path = useMemo(() => {
    if (!kiosk || !dest) return []
    return findPath(kiosk.id, dest.id, floorLocs.map(l => l.id))
  }, [kiosk, dest, floorLocs])

  const pathD = useMemo(() => {
    if (path.length < 2) return null
    return path.reduce((d, id, i) => {
      const loc = floorLocs.find(l => l.id === id)
      if (!loc) return d
      return d + (i === 0 ? `M${sx(loc.x)},${sy(loc.y)}` : ` L${sx(loc.x)},${sy(loc.y)}`)
    }, '')
  }, [path, floorLocs])

  return (
    <svg
      viewBox={`0 0 ${SCALE.W} ${SCALE.H}`}
      width="100%" height="100%"
      style={{ background: '#070d1a', borderRadius: 12, display: 'block' }}
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
        return (
          <rect key={`room-${i}`}
            x={bx} y={by} width={bw} height={bh} rx="3"
            fill={meta.fill || '#0d1b2e'}
            stroke="#1a3a5c" strokeWidth="1" opacity="0.9"
          />
        )
      })}

      {/* ── PASS 3: Building labels centered ── */}
      {blocks.filter(b => b.type === 'building').map((b, i) => {
        const bx = sx(b.x), by = sy(b.y)
        const bw = sx(b.x + b.w) - sx(b.x)
        const bh = sy(b.y + b.h) - sy(b.y)
        const cx = bx + bw / 2
        const cy = by + bh / 2
        const info = BLDG_LABELS[b.label]
        if (!info) return null
        const fs = Math.min(bw / 5, bh / 3, 36)
        return (
          <g key={`blbl-${i}`} style={{ pointerEvents: 'none' }}>
            <rect
              x={cx - fs * 0.9} y={cy - fs * 0.65}
              width={fs * 1.8} height={fs * 1.2}
              rx="8" fill={info.color} opacity="0.12"
            />
            <text x={cx} y={cy}
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

      {/* ── Route line — kiosk to destination, with animated walking dot ── */}
      {pathD && (
        <g>
          <path d={pathD} fill="none" stroke="#5B8DEF" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
          <path id="mobile-anim-path" d={pathD} fill="none" stroke="none"/>
          <circle r="5" fill="#5B8DEF" opacity="0.95">
            <animateMotion dur="3s" repeatCount="indefinite">
              <mpath href="#mobile-anim-path"/>
            </animateMotion>
          </circle>
        </g>
      )}

      {/* ── Kiosk "You Are Here" marker ── */}
      {kiosk && kiosk.id !== dest?.id && (
        <g>
          <circle cx={sx(kiosk.x)} cy={sy(kiosk.y)} r={13}
            fill="#0ea5e922">
            <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx={sx(kiosk.x)} cy={sy(kiosk.y)} r={9}
            fill="#0c2240" stroke="#0ea5e9" strokeWidth="2.5"/>
          <text x={sx(kiosk.x)} y={sy(kiosk.y) + 17}
            textAnchor="middle"
            style={{ fontSize: 7, fill: '#0ea5e9', fontFamily: 'monospace', fontWeight: 700 }}>
            START
          </text>
        </g>
      )}

      {/* ── Destination highlight — pulse dot + label placed clear of the marker ── */}
      {dest && (
        <g>
          <circle cx={sx(dest.x)} cy={sy(dest.y)} r={16}
            fill="#5B8DEF22">
            <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx={sx(dest.x)} cy={sy(dest.y)} r={12}
            fill="#0d2d4a" stroke="#5B8DEF" strokeWidth="2.5"/>
          {(() => {
            const labelAbove = sy(dest.y) - 32 > 6
            const labelY = labelAbove ? sy(dest.y) - 32 : sy(dest.y) + 20
            const textY  = labelAbove ? sy(dest.y) - 24 : sy(dest.y) + 30
            return (
              <>
                <rect
                  x={sx(dest.x) - 45} y={labelY}
                  width="90" height="16" rx="4"
                  fill="#5B8DEF" opacity="0.95"
                />
                <text x={sx(dest.x)} y={textY}
                  textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: 8, fill: '#ffffff', fontFamily: 'monospace', fontWeight: 700 }}>
                  {dest.name.length > 14 ? dest.name.slice(0, 13) + '…' : dest.name}
                </text>
              </>
            )
          })()}
        </g>
      )}

      {!dest && (
        <text x={sx(11)} y={sy(11)}
          textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 14, fill: '#1e3a5f', fontFamily: 'monospace' }}>
          Destination not on this floor
        </text>
      )}
    </svg>
  )
}

// ── Main MobilePage ───────────────────────────────────────────
export default function MobilePage() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (!document.getElementById('inter-font')) {
      const link = document.createElement('link')
      link.id = 'inter-font'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
      document.head.appendChild(link)
    }
  }, [])

  const destId   = searchParams.get('to')
  const destName = searchParams.get('name')
  const floor    = parseInt(searchParams.get('floor') || '1')
  const building = searchParams.get('building')

  const dest = LOCATIONS.find(l => String(l.id) === String(destId))
  const name = dest?.name || destName || 'Unknown Location'
  const floorLabel = FLOOR_LABELS[floor] || `Floor ${floor}`
  const meta = TYPE_META[dest?.type] || { color: '#9B9BF5' }

  const floorKeys = useMemo(
    () => Object.keys(FLOOR_BLOCKS).map(Number).sort((a, b) => a - b),
    []
  )

  const [mapExpanded, setMapExpanded] = useState(false)
  const [zoomScale, setZoomScale] = useState(1)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 0, y: 0 })
  const pinchRef = useState(() => ({ startDist: 0, startScale: 1 }))[0]

  // Reset zoom whenever the modal opens or closes
  useEffect(() => {
    if (mapExpanded) { setZoomScale(1); setZoomOrigin({ x: 0, y: 0 }) }
  }, [mapExpanded])

  const getDist = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.startDist = getDist(e.touches)
      pinchRef.startScale = zoomScale

      // Find the midpoint between the two fingers, relative to the map container,
      // so zoom anchors to where the user is actually pinching (e.g. Building 3)
      const rect = e.currentTarget.getBoundingClientRect()
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2
      const originX = ((midX - rect.left) / rect.width) * 100
      const originY = ((midY - rect.top) / rect.height) * 100
      setZoomOrigin({ x: originX, y: originY })
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const newDist = getDist(e.touches)
      if (pinchRef.startDist > 0) {
        const ratio = newDist / pinchRef.startDist
        const next = Math.min(Math.max(pinchRef.startScale * ratio, 1), 4)
        setZoomScale(next)
      }
    }
  }

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      pinchRef.startDist = 0
    }
  }

  const handleDoubleClick = (e) => {
    if (zoomScale > 1) {
      setZoomScale(1)
      setZoomOrigin({ x: 50, y: 50 })
    } else {
      const rect = e.currentTarget.getBoundingClientRect()
      const originX = ((e.clientX - rect.left) / rect.width) * 100
      const originY = ((e.clientY - rect.top) / rect.height) * 100
      setZoomOrigin({ x: originX, y: originY })
      setZoomScale(2)
    }
  }
  

  const directions = [
    { Icon: Icon.Walk, text: 'Start at the kiosk', sub: 'Ground Floor · Building 4 · Near Elevator' },
    { Icon: Icon.ArrowRight, text: 'Walk through the main hallway', sub: 'Head towards your destination building' },
    floor > 1
      ? { Icon: Icon.Stairs, text: `Take the stairs up to ${floorLabel}`, sub: 'Follow the staircase signs' }
      : null,
    { Icon: Icon.Flag, text: `Arrive at ${name}`, sub: `${floorLabel}${building ? ` · Building ${building}` : ''}` },
  ].filter(Boolean)

  return (
    <div style={s.page}>

      {/* Background: gradient & ambient glow */}
      <div style={s.ambientWrap}>
        <div style={s.ambient1}/>
        <div style={s.ambient2}/>
      </div>

      {/* ── Header ── */}
      <div style={s.header}>
        <div style={s.headerLogo}>
          <img src={icctLogo} alt="ICCT Colleges" style={s.logoImg}/>
          <div>
            <p style={s.headerTitle}>Smart Campus Navigator</p>
            <p style={s.headerSub}>ICCT Colleges · Cainta, Rizal</p>
          </div>
        </div>
      </div>

      <div style={s.content}>

        {/* ── Destination card ── */}
        <div style={s.card}>
          <p style={s.cardLabel}><Icon.Pin size={13}/> YOUR DESTINATION</p>
          <p style={s.destName}>{name}</p>
          <div style={s.destMeta}>
            <span style={{ ...s.destBadge, borderColor: meta.color + '55', color: meta.color }}>
              {floorLabel}
            </span>
            {building && (
              <span style={{ ...s.destBadge, borderColor: meta.color + '55', color: meta.color }}>
                Building {building}
              </span>
            )}
            {dest?.type && (
              <span style={{ ...s.destBadge, borderColor: meta.color + '55', color: meta.color }}>
                {dest.type}
              </span>
            )}
          </div>
          {dest?.desc && <p style={s.destDesc}>{dest.desc}</p>}
        </div>

        {/* ── Mini Map — single floor, with highlighted route line, tap to expand ── */}
        <div style={s.card}>
          <div style={s.mapCardHeader}>
            <p style={{ ...s.cardLabel, margin: 0 }}><Icon.Map size={13}/> LOCATION MAP</p>
            <span style={s.expandHint}><Icon.Expand size={12}/> Tap to zoom</span>
          </div>
          <div style={s.mapWrap} onClick={() => setMapExpanded(true)}>
            <MiniMap floor={floor} destId={dest?.id || parseInt(destId)}/>
          </div>
          <p style={s.mapNote}>
            Blue line = your route · Highlighted room = your destination
          </p>
        </div>

        {/* ── Directions ── */}
        <div style={s.card}>
          <p style={s.cardLabel}><Icon.List size={13}/> HOW TO GET THERE</p>
          <div style={s.stepsList}>
            {directions.map((step, i) => (
              <div key={i} style={s.step}>
                <div style={s.stepIcon}><step.Icon size={18}/></div>
                <div style={s.stepContent}>
                  <p style={s.stepText}>{step.text}</p>
                  {step.sub && <p style={s.stepSub}>{step.sub}</p>}
                </div>
                {i < directions.length - 1 && <div style={s.connector}/>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Floor indicator — static reference list, matches MapPage's floor count ── */}
        <div style={s.card}>
          <p style={s.cardLabel}><Icon.Building size={13}/> FLOOR GUIDE</p>
          <div style={s.floorGuide}>
            {floorKeys.map(f => (
              <div key={f} style={{ ...s.floorItem, ...(f === floor ? s.floorItemActive : {}) }}>
                <span style={s.floorNum}>{f === 1 ? 'GF' : `${f}F`}</span>
                <span style={s.floorName}>
                  {f === floor ? name : FLOOR_LABELS[f]?.replace(' Floor', '') || `Floor ${f}`}
                </span>
                {f === floor && <span style={s.floorYouAre}>HERE</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Tips ── */}
        <div style={s.tipsCard}>
          <p style={s.tipsTitle}><Icon.Lightbulb size={14}/> Helpful Tips</p>
          <p style={s.tipText}>Follow the directional signs inside the campus</p>
          <p style={s.tipText}>Ask any guard or staff if you need help</p>
          <p style={s.tipText}>The kiosk is located near the elevator, Building 4</p>
        </div>

        {/* ── Footer ── */}
        <div style={s.footer}>
          <p style={s.footerText}>ICCT Smart Campus Navigator</p>
          <p style={s.footerSub}>Cainta Campus · Directions from Kiosk</p>
        </div>

      </div>

      {/* ── Fullscreen expanded map — supports native pinch-to-zoom ── */}
      {mapExpanded && (
        <div style={s.modalOverlay} onClick={() => setMapExpanded(false)}>
          <div style={s.modalHeader}>
            <p style={s.modalTitle}>{name} · {floorLabel}</p>
            <button style={s.modalCloseBtn} onClick={() => setMapExpanded(false)}>
              <Icon.Close size={22}/>
            </button>
          </div>
          <div
            style={s.modalMapScroll}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleDoubleClick}
          >
            <div style={{...s.modalMapInner,
                    transform: `scale(${zoomScale})`,
                    transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                    transition: zoomScale === 1 ? 'transform 0.2s ease' : 'none'
                    }}>
              <MiniMap floor={floor} destId={dest?.id || parseInt(destId)}/>
            </div>
          </div>
          <p style={s.modalHint}>
            {zoomScale > 1 ? `Zoomed ${zoomScale.toFixed(1)}× · Double-tap to reset` : 'Pinch to zoom · Double-tap to zoom in · Tap outside to close'}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────
const s = {
  page: {
    background: 'linear-gradient(135deg, #040816 0%, #07182E 50%, #04111D 100%)',
    minHeight: '100vh',
    color: 'white',
    fontFamily: "'Inter', system-ui, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },

  ambientWrap: { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' },
  ambient1: { position: 'absolute', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,141,239,0.12) 0%, transparent 70%)', top: '-8%', left: '-15%', filter: 'blur(50px)' },
  ambient2: { position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.10) 0%, transparent 70%)', bottom: '5%', right: '-15%', filter: 'blur(55px)' },

  content: { position: 'relative', zIndex: 1, paddingBottom: '2rem' },

  header: {
    background: 'rgba(7,24,46,0.55)',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    padding: '16px 20px',
    position: 'relative', zIndex: 2,
  },
  headerLogo: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoImg: { height: '40px', width: 'auto', flexShrink: 0, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' },
  headerTitle: { fontSize: '16px', fontWeight: '700', color: 'white', margin: 0 },
  headerSub:   { fontSize: '12px', color: '#7fa8bd', margin: 0, marginTop: '2px' },

  card: {
    background: 'rgba(7,18,32,0.5)',
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '20px', margin: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  },
  cardLabel: {
    fontSize: '11px', letterSpacing: '1.5px', color: '#7fa8bd',
    textTransform: 'uppercase', margin: '0 0 12px 0',
    display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600,
  },
  destName: {
    fontSize: '24px', fontWeight: '700', color: '#9B9BF5',
    margin: '0 0 12px 0', lineHeight: 1.2,
  },
  destMeta:  { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' },
  destBadge: { border: '1px solid', borderRadius: '20px', padding: '4px 12px', fontSize: '12px' },
  destDesc:  { fontSize: '13px', color: '#7fa8bd', lineHeight: 1.5, margin: 0 },

  mapCardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
  expandHint: {
    fontSize: '10px', color: '#9B9BF5', display: 'flex', alignItems: 'center', gap: '4px',
    background: 'rgba(124,124,240,0.12)', border: '1px solid rgba(124,124,240,0.3)',
    borderRadius: '20px', padding: '4px 10px', fontWeight: 600,
  },
  mapWrap: {
    width: '100%',
    height: '220px',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer',
  },
  mapNote: { fontSize: '11px', color: '#7fa8bd', textAlign: 'center', margin: 0 },

  // Fullscreen map modal
  modalOverlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(2,5,15,0.96)',
    backdropFilter: 'blur(8px)',
    display: 'flex', flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 18px', flexShrink: 0,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  modalTitle: { fontSize: '14px', fontWeight: 700, color: '#9B9BF5', margin: 0 },
  modalCloseBtn: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '50%', width: '38px', height: '38px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', cursor: 'pointer', flexShrink: 0,
  },
  modalMapScroll: {
    flex: 1, overflow: 'hidden', touchAction: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
  },
  modalMapInner: {
    width: '100%', maxWidth: '600px', aspectRatio: '4 / 3',
    transformOrigin: 'center center',
  },
  modalHint: {
    fontSize: '11px', color: '#5a7a8a', textAlign: 'center',
    padding: '12px', margin: 0, flexShrink: 0,
  },

  stepsList: { display: 'flex', flexDirection: 'column' },
  step: {
    display: 'flex', gap: '14px', alignItems: 'flex-start',
    position: 'relative', paddingBottom: '20px',
  },
  stepIcon: {
    flexShrink: 0, width: '36px', height: '36px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(124,124,240,0.12)', border: '1px solid rgba(124,124,240,0.3)', borderRadius: '50%',
    color: '#9B9BF5',
  },
  stepContent: { paddingTop: '4px', flex: 1 },
  stepText: { fontSize: '15px', fontWeight: '600', color: '#dceaf9', margin: '0 0 4px 0' },
  stepSub:  { fontSize: '12px', color: '#7fa8bd', margin: 0 },
  connector: {
    position: 'absolute', left: '17px', top: '40px',
    bottom: '0', width: '2px', background: 'rgba(255,255,255,0.08)',
  },

  floorGuide: { display: 'flex', flexDirection: 'column', gap: '8px' },
  floorItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
  },
  floorItemActive: { background: 'rgba(124,124,240,0.1)', border: '1px solid rgba(124,124,240,0.4)' },
  floorNum:   { fontSize: '13px', fontWeight: '700', color: '#9B9BF5', width: '28px', flexShrink: 0 },
  floorName:  { fontSize: '13px', color: '#a8c5d4', flex: 1 },
  floorYouAre:{ fontSize: '11px', color: '#9B9BF5', fontWeight: '700' },

  tipsCard: {
    background: 'rgba(76,175,80,0.06)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(76,175,80,0.25)',
    borderRadius: '16px', padding: '16px 20px', margin: '0 16px 16px',
  },
  tipsTitle: { fontSize: '13px', fontWeight: '700', color: '#4CAF50', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' },
  tipText:   { fontSize: '12px', color: '#86e092', margin: '0 0 4px 0', lineHeight: 1.5 },

  footer:     { textAlign: 'center', padding: '20px' },
  footerText: { fontSize: '13px', color: '#3a5a7a', margin: '0 0 4px 0', fontWeight: '600' },
  footerSub:  { fontSize: '11px', color: '#2a4560', margin: 0 },
}
