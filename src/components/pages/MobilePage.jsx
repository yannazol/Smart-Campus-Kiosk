import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  LOCATIONS, FLOOR_BLOCKS, FLOOR_LABELS,
  TYPE_META, SCALE, sx, sy
} from '../../data/campusData'

// ── Mini SVG Map ──────────────────────────────────────────────
const BLDG_LABELS = {
  'Building 1': { short: 'B1', color: '#378add' },
  'Building 2': { short: 'B2', color: '#1d9e75' },
  'Building 3': { short: 'B3', color: '#f59e0b' },
  'Building 4': { short: 'B4', color: '#a78bfa' },
}

function MiniMap({ floor, destId }) {
  const blocks    = FLOOR_BLOCKS[floor] || FLOOR_BLOCKS[1]
  const floorLocs = LOCATIONS.filter(l => l.floor === floor)
  const dest      = floorLocs.find(l => l.id === destId)

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

      {/* ── Destination highlight ── */}
      {dest && (
        <g>
          {/* Pulse ring */}
          <circle cx={sx(dest.x)} cy={sy(dest.y)} r={16}
            fill="#378add22">
            <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite"/>
          </circle>
          {/* Destination circle */}
          <circle cx={sx(dest.x)} cy={sy(dest.y)} r={12}
            fill="#0d2d4a" stroke="#378add" strokeWidth="2.5"/>
          {/* Flag icon */}
          <text x={sx(dest.x)} y={sy(dest.y)}
            textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: 10, fontFamily: 'monospace' }}>
            🏁
          </text>
          {/* Destination name label */}
          <rect
            x={sx(dest.x) - 45} y={sy(dest.y) - 32}
            width="90" height="16" rx="4"
            fill="#378add" opacity="0.9"
          />
          <text x={sx(dest.x)} y={sy(dest.y) - 24}
            textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: 8, fill: '#ffffff', fontFamily: 'monospace', fontWeight: 700 }}>
            {dest.name.length > 14 ? dest.name.slice(0, 13) + '…' : dest.name}
          </text>
        </g>
      )}

      {/* ── No destination found message ── */}
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

  const destId   = searchParams.get('to')
  const destName = searchParams.get('name')
  const floor    = parseInt(searchParams.get('floor') || '1')
  const building = searchParams.get('building')

  const dest = LOCATIONS.find(l => String(l.id) === String(destId))
  const name = dest?.name || destName || 'Unknown Location'
  const floorLabel = FLOOR_LABELS[floor] || `Floor ${floor}`
  const meta = TYPE_META[dest?.type] || { color: '#6eb6ff', icon: '📍' }

  const directions = [
    { icon: '🚶', text: 'Start at the kiosk', sub: 'Ground Floor · Building 4 · Near Elevator' },
    { icon: '➡️', text: 'Walk through the main hallway', sub: 'Head towards your destination building' },
    floor > 1
      ? { icon: '🪜', text: `Take the stairs up to ${floorLabel}`, sub: 'Follow the staircase signs' }
      : null,
    { icon: '🏁', text: `Arrive at ${name}`, sub: `${floorLabel}${building ? ` · Building ${building}` : ''}` },
  ].filter(Boolean)

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div style={s.headerLogo}>
          <div style={s.logoBadge}>ICCT</div>
          <div>
            <p style={s.headerTitle}>Smart Campus Navigator</p>
            <p style={s.headerSub}>ICCT Colleges · Cainta, Rizal</p>
          </div>
        </div>
      </div>

      {/* ── Destination card ── */}
      <div style={s.card}>
        <p style={s.cardLabel}>📍 YOUR DESTINATION</p>
        <p style={s.destName}>{name}</p>
        <div style={s.destMeta}>
          <span style={{ ...s.destBadge, borderColor: meta.color, color: meta.color }}>
            {floorLabel}
          </span>
          {building && (
            <span style={{ ...s.destBadge, borderColor: meta.color, color: meta.color }}>
              Building {building}
            </span>
          )}
          {dest?.type && (
            <span style={{ ...s.destBadge, borderColor: meta.color, color: meta.color }}>
              {dest.type}
            </span>
          )}
        </div>
        {dest?.desc && <p style={s.destDesc}>{dest.desc}</p>}
      </div>

      {/* ── Mini Map ── */}
      <div style={s.card}>
        <p style={s.cardLabel}>🗺️ LOCATION MAP</p>
        <div style={s.mapWrap}>
          <MiniMap floor={floor} destId={dest?.id || parseInt(destId)}/>
        </div>
        <p style={s.mapNote}>
          🔵 Highlighted room = your destination · {floorLabel}
        </p>
      </div>

      {/* ── Directions ── */}
      <div style={s.card}>
        <p style={s.cardLabel}>📋 HOW TO GET THERE</p>
        <div style={s.stepsList}>
          {directions.map((step, i) => (
            <div key={i} style={s.step}>
              <div style={s.stepIcon}>{step.icon}</div>
              <div style={s.stepContent}>
                <p style={s.stepText}>{step.text}</p>
                {step.sub && <p style={s.stepSub}>{step.sub}</p>}
              </div>
              {i < directions.length - 1 && <div style={s.connector}/>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Floor indicator ── */}
      <div style={s.card}>
        <p style={s.cardLabel}>🏢 FLOOR GUIDE</p>
        <div style={s.floorGuide}>
          {[1, 2, 3, 4].map(f => (
            <div key={f} style={{ ...s.floorItem, ...(f === floor ? s.floorItemActive : {}) }}>
              <span style={s.floorNum}>{f === 1 ? 'GF' : `${f}F`}</span>
              <span style={s.floorName}>
                {f === floor ? name : FLOOR_LABELS[f]?.replace(' Floor', '') || `Floor ${f}`}
              </span>
              {f === floor && <span style={s.floorYouAre}>← HERE</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Tips ── */}
      <div style={s.tipsCard}>
        <p style={s.tipsTitle}>💡 Helpful Tips</p>
        <p style={s.tipText}>• Follow the directional signs inside the campus</p>
        <p style={s.tipText}>• Ask any guard or staff if you need help</p>
        <p style={s.tipText}>• The kiosk is located near the elevator, Building 4</p>
      </div>

      {/* ── Footer ── */}
      <div style={s.footer}>
        <p style={s.footerText}>ICCT Smart Campus Navigator</p>
        <p style={s.footerSub}>Cainta Campus · Directions from Kiosk</p>
      </div>

    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────
const s = {
  page: {
    background: '#0a1628',
    minHeight: '100vh',
    color: 'white',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    paddingBottom: '2rem',
  },
  header: {
    background: '#0f2040',
    borderBottom: '1px solid #1e3a5f',
    padding: '16px 20px',
  },
  headerLogo: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoBadge: {
    background: '#378add', color: 'white', fontWeight: '700',
    fontSize: '16px', padding: '8px 12px', borderRadius: '8px',
    letterSpacing: '2px', flexShrink: 0,
  },
  headerTitle: { fontSize: '16px', fontWeight: '700', color: 'white', margin: 0 },
  headerSub:   { fontSize: '12px', color: '#4a7fb5', margin: 0, marginTop: '2px' },
  card: {
    background: '#0f2040', border: '1px solid #1e3a5f',
    borderRadius: '16px', padding: '20px', margin: '16px',
  },
  cardLabel: {
    fontSize: '11px', letterSpacing: '1.5px', color: '#4a7fb5',
    textTransform: 'uppercase', margin: '0 0 12px 0',
  },
  destName: {
    fontSize: '26px', fontWeight: '700', color: '#6eb6ff',
    margin: '0 0 12px 0', lineHeight: 1.2,
  },
  destMeta:  { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' },
  destBadge: { border: '1px solid', borderRadius: '20px', padding: '4px 12px', fontSize: '12px' },
  destDesc:  { fontSize: '13px', color: '#4a7fb5', lineHeight: 1.5, margin: 0 },
  // Map
  mapWrap: {
    width: '100%',
    height: '220px',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '10px',
    border: '1px solid #1e3a5f',
  },
  mapNote: { fontSize: '11px', color: '#4a7fb5', textAlign: 'center', margin: 0 },
  // Steps
  stepsList: { display: 'flex', flexDirection: 'column' },
  step: {
    display: 'flex', gap: '14px', alignItems: 'flex-start',
    position: 'relative', paddingBottom: '20px',
  },
  stepIcon: {
    fontSize: '20px', flexShrink: 0, width: '36px', height: '36px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#162d55', border: '1px solid #1e3a5f', borderRadius: '50%',
  },
  stepContent: { paddingTop: '4px', flex: 1 },
  stepText: { fontSize: '15px', fontWeight: '600', color: '#c8ddf5', margin: '0 0 4px 0' },
  stepSub:  { fontSize: '12px', color: '#4a7fb5', margin: 0 },
  connector: {
    position: 'absolute', left: '17px', top: '40px',
    bottom: '0', width: '2px', background: '#1e3a5f',
  },
  // Floor guide
  floorGuide: { display: 'flex', flexDirection: 'column', gap: '8px' },
  floorItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 14px', background: '#0a1628',
    border: '1px solid #1e3a5f', borderRadius: '10px',
  },
  floorItemActive: { background: '#0d2d4a', border: '1px solid #378add' },
  floorNum:   { fontSize: '13px', fontWeight: '700', color: '#378add', width: '28px', flexShrink: 0 },
  floorName:  { fontSize: '13px', color: '#8ab4d8', flex: 1 },
  floorYouAre:{ fontSize: '11px', color: '#378add', fontWeight: '700' },
  // Tips
  tipsCard: {
    background: '#0c2010', border: '1px solid #1d5030',
    borderRadius: '16px', padding: '16px 20px', margin: '0 16px 16px',
  },
  tipsTitle: { fontSize: '13px', fontWeight: '700', color: '#3dcaa5', margin: '0 0 8px 0' },
  tipText:   { fontSize: '12px', color: '#1d9e75', margin: '0 0 4px 0', lineHeight: 1.5 },
  // Footer
  footer:     { textAlign: 'center', padding: '20px' },
  footerText: { fontSize: '13px', color: '#1e3a5f', margin: '0 0 4px 0', fontWeight: '600' },
  footerSub:  { fontSize: '11px', color: '#162d55', margin: 0 },
}
