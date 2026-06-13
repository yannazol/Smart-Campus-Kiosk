import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

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

export default function Home() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [time, setTime] = useState(new Date())
  const [logoTaps, setLogoTaps] = useState(0)
  const [recommendations, setRecommendations] = useState([])
  const [capsOn, setCapsOn] = useState(true)

  const backspacePressTimer = useRef(null)
  const backspaceHoldTimer = useRef(null)
  const isHolding = useRef(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (logoTaps === 3) {
      navigate('/admin')
      setLogoTaps(0)
    }
  }, [logoTaps, navigate])

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

  const formatTime = (date) => date.toLocaleTimeString('en-PH', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })

  const formatDate = (date) => date.toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

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

  const handleNumber = (num) => {
    setSearch(prev => prev + num)
  }

  const handleBackspace = useCallback(() => {
    setSearch(prev => prev.slice(0, -1))
  }, [])

  const handleClear = () => {
    setSearch('')
    setRecommendations([])
  }

  const handleOutsideClick = () => {
    setIsSearching(false)
  }

  const handleBackspaceDown = (e) => {
    e.preventDefault()
    isHolding.current = false
    backspacePressTimer.current = setTimeout(() => {
      isHolding.current = true
      setSearch('')
      setRecommendations([])
    }, 600)
  }

  const handleBackspaceUp = (e) => {
    e.preventDefault()
    clearTimeout(backspacePressTimer.current)
    clearTimeout(backspaceHoldTimer.current)
    if (!isHolding.current) {
      handleBackspace()
    }
    isHolding.current = false
  }

  useEffect(() => {
    return () => {
      clearTimeout(backspacePressTimer.current)
      clearTimeout(backspaceHoldTimer.current)
    }
  }, [])

  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div onClick={() => setLogoTaps(p => p + 1)} style={styles.logoBox}>
          <div style={styles.logoPlaceholder}>ICCT</div>
        </div>

        {/* Kiosk Name */}
        <div style={styles.kioskName}>
          <div style={styles.kioskTextBlock}>
            <span style={styles.kioskTitle}>Smart Campus Navigator</span>
            <span style={styles.kioskSub}>ICCT Colleges · Cainta, Rizal</span>
          </div>
        </div>

        {/* Time | Date side by side */}
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
            style={{
              ...styles.searchBox,
              ...(isSearching ? styles.searchBoxActive : {}),
            }}
            onClick={(e) => { e.stopPropagation(); setIsSearching(true) }}
          >
            <span style={styles.searchIcon}>🔍</span>
            <span style={{ flex: 1, fontSize: '20px', color: search ? 'white' : '#4a7fb5' }}>
              {search || 'Tap here to search for a location...'}
            </span>
            {search.length > 0 && (
              <button
                onMouseDown={(e) => { e.preventDefault(); handleClear() }}
                style={styles.clearBtn}
              >
                ✕
              </button>
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
                      <button
                        key={r}
                        onMouseDown={(e) => { e.preventDefault(); handleSearch(r) }}
                        style={styles.recoChip}
                      >
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
                        <button
                          key={place}
                          onMouseDown={(e) => { e.preventDefault(); handleSearch(place) }}
                          style={styles.chip}
                        >
                          {place}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={styles.dropSection}>
                    <p style={styles.dropLabel}>🏷️ Categories</p>
                    <div style={styles.chipRow}>
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onMouseDown={(e) => { e.preventDefault(); handleSearch(cat) }}
                          style={{ ...styles.chip, ...styles.chipCat }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Persistent search pill when keyboard is closed */}
          {!isSearching && search.length > 0 && (
            <div style={styles.persistRow}>
              <span style={styles.persistLabel}>Searching for:</span>
              <span style={styles.persistPill}>{search}</span>
              <button
                onMouseDown={(e) => { e.preventDefault(); handleClear() }}
                style={styles.persistClear}
              >
                ✕ Clear
              </button>
            </div>
          )}
        </div>



        {/* ── Virtual Keyboard ── */}
        {isSearching && (
          <div style={styles.keyboard} onClick={(e) => e.stopPropagation()}>

            <div style={styles.keyRow}>
              {NUMBER_ROW.map((num) => (
                <button
                  key={num}
                  onMouseDown={(e) => { e.preventDefault(); handleNumber(num) }}
                  style={styles.key}
                >
                  {num}
                </button>
              ))}
            </div>

            {KEYBOARD_ROWS.map((row, i) => (
              <div key={i} style={styles.keyRow}>
                {row.map((key) => (
                  <button
                    key={key}
                    onMouseDown={(e) => { e.preventDefault(); handleKey(key) }}
                    style={styles.key}
                  >
                    {capsOn ? key.toUpperCase() : key.toLowerCase()}
                  </button>
                ))}
              </div>
            ))}

            <div style={styles.keyRow}>
              <button
                onMouseDown={(e) => { e.preventDefault(); setCapsOn(p => !p) }}
                style={{ ...styles.key, ...styles.keyCaps, ...(capsOn ? styles.keyCapsActive : {}) }}
              >
                {capsOn ? '⬆ ABC' : '⬆ abc'}
              </button>
              <button
                onMouseDown={handleBackspaceDown}
                onMouseUp={handleBackspaceUp}
                onMouseLeave={handleBackspaceUp}
                onTouchStart={handleBackspaceDown}
                onTouchEnd={handleBackspaceUp}
                style={{ ...styles.key, ...styles.keyWide }}
                title="Tap to delete · Hold to clear all"
              >
                ⌫
              </button>
              <button
                onMouseDown={(e) => { e.preventDefault(); handleKey(' ') }}
                style={{ ...styles.key, ...styles.keySpace }}
              >
                SPACE
              </button>
              <button
                onMouseDown={(e) => { e.preventDefault(); if (search.trim()) handleSearch(search.trim()) }}
                style={{
                  ...styles.key,
                  ...styles.keySearch,
                  ...(search.trim() ? {} : styles.keySearchDisabled),
                }}
              >
                SEARCH
              </button>
            </div>
          </div>
        )}

      </div>





      

    </div>
  )
}




{/* ── Styles ── */}

const styles = {
  page: {
    background: '#0a1628',
    height: '100vh',
    width: '100%',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #1e3a5f',
    background: '#0f2040',
    flexShrink: 0,
  },
  logoBox: { cursor: 'pointer', userSelect: 'none' },
  logoPlaceholder: {
    background: '#378add',
    color: 'white',
    fontWeight: '700',
    fontSize: '22px',
    padding: '10px 18px',
    borderRadius: '10px',
    letterSpacing: '2px',
  },
  kioskName: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  kioskTextBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  kioskTitle: { fontSize: '26px', fontWeight: '700', color: 'white' },
  kioskSub:   { fontSize: '13px', color: '#4a7fb5', marginTop: '2px' },
  dateTime: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '20px',
  },
  timeText: {
    fontSize: '30px',
    fontWeight: '550',
    color: '#6eb6ff',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '1px',
  },
  timeDivider: {
    fontSize: '22px',
    color: '#1e3a5f',
    fontWeight: '300',
  },
  dateText: {
    fontSize: '20px',
    color: '#8ab4d8',
    fontWeight: '400',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '1.25rem',
    overflow: 'hidden',
    position: 'relative',
  },
  topSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  headingBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '4rem',
    marginBottom: '2rem',
  },
  heading: {
    fontSize: '54px',
    fontWeight: '300',
    textAlign: 'center',
    margin: 0,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: '#0f2040',
    border: '2px solid #1e3a5f',
    borderRadius: '50px',
    padding: '16px 28px',
    gap: '14px',
    width: '100%',
    maxWidth: '960px',
    cursor: 'pointer',
    marginBottom: '0.75rem',
    minHeight: '64px',
    transition: 'border-color 0.2s',
  },
  searchBoxActive: {
    border: '2px solid #378add',
  },
  searchIcon: { fontSize: '22px' },
  clearBtn: {
    background: 'transparent',
    border: 'none',
    color: '#4a7fb5',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px',
    minWidth: '44px',
    minHeight: '44px',
  },
  persistRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '4px',
  },
  persistLabel: {
    fontSize: '13px',
    color: '#4a7fb5',
  },
  persistPill: {
    background: '#162d55',
    border: '1px solid #378add',
    borderRadius: '20px',
    padding: '4px 16px',
    fontSize: '15px',
    color: '#6eb6ff',
  },
  persistClear: {
    background: 'transparent',
    border: '1px solid #1e3a5f',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '13px',
    color: '#4a7fb5',
    cursor: 'pointer',
  },
  dropdown: {
    width: '100%',
    maxWidth: '960px',
    background: '#0f2040',
    border: '1px solid #1e3a5f',
    borderRadius: '16px',
    padding: '1rem 1.25rem',
    marginBottom: '0.5rem',
  },
  dropSection: { marginBottom: '0.75rem' },
  dropLabel: {
    fontSize: '13px',
    color: '#4a7fb5',
    marginBottom: '8px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  chip: {
    background: '#162d55',
    border: '1px solid #1e3a5f',
    borderRadius: '24px',
    padding: '10px 20px',
    color: '#c8ddf5',
    fontSize: '17px',
    cursor: 'pointer',
    minHeight: '44px',
  },
  chipCat: { background: '#0c2d5a', color: '#6eb6ff' },
  recoChip: {
    background: '#0c3825',
    border: '1px solid #1d9e75',
    borderRadius: '24px',
    padding: '10px 20px',
    color: '#3dcaa5',
    fontSize: '17px',
    cursor: 'pointer',
    minHeight: '44px',
  },
  keyboard: {
    width: '100%',
    background: '#0f2040',
    border: '1px solid #1e3a5f',
    borderRadius: '16px',
    padding: '0.85rem 1rem',
    flexShrink: 0,
  },
  keyRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    marginBottom: '6px',
  },
  key: {
    background: '#162d55',
    border: '1px solid #1e3a5f',
    borderRadius: '20px',
    color: 'white',
    fontSize: '23px',
    fontWeight: '600',
    padding: '16px 0',
    flex: 1,
    maxWidth: '110px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.08s, transform 0.08s',
    minHeight: '58px',
  },
  keyCaps: {
    maxWidth: '106px',
    color: '#4a7fb5',
  },
  keyCapsActive: {
    background: '#1e3a5f',
    color: '#6eb6ff',
  },
  keyWide:  { maxWidth: '106px' },
  keySpace: { maxWidth: '340px' },
  keySearch: {
    maxWidth: '150px',
    background: '#378add',
    border: '1px solid #378add',
    color: 'white',
  },
  keySearchDisabled: {
    background: '#1e3a5f',
    border: '1px solid #1e3a5f',
    color: '#4a7fb5',
    cursor: 'not-allowed',
  },
  
}
