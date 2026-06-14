import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const IDLE_TIME    = 10 *45 * 1000  // 45 seconds-----------------------------------------
const WARNING_TIME = 10              // 10 second countdown-------------------------------

export default function IdleTimeout() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [warning, setWarning]   = useState(false)
  const [countdown, setCountdown] = useState(WARNING_TIME)
  const idleTimer = useRef(null)
  const countdownRef = useRef(null)

  // Don't run on splash screen or mobile page
  const skip = ['/', '/directions'].includes(location.pathname)

  const clearAllTimers = () => {
    clearTimeout(idleTimer.current)
    clearInterval(countdownRef.current)
  }

  const goToSplash = useCallback(() => {
    clearAllTimers()
    setWarning(false)
    setCountdown(WARNING_TIME)
    sessionStorage.removeItem('chatbot_messages')
    navigate('/')
  }, [navigate])

  const resetTimer = useCallback(() => {
    if (skip) return
    clearAllTimers()
    setWarning(false)
    setCountdown(WARNING_TIME)

    // Start idle timer
    idleTimer.current = setTimeout(() => {
      // Show warning after 2 minutes
      setWarning(true)
      let count = WARNING_TIME

      countdownRef.current = setInterval(() => {
        count -= 1
        setCountdown(count)
        if (count <= 0) {
          clearInterval(countdownRef.current)
          goToSplash()
        }
      }, 1000)
    }, IDLE_TIME)
  }, [skip, goToSplash])

  // Listen for any user activity
  useEffect(() => {
    if (skip) return
    const events = ['mousedown', 'mousemove', 'touchstart', 'keydown', 'scroll', 'click']
    events.forEach(e => window.addEventListener(e, resetTimer))
    resetTimer()
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer))
      clearAllTimers()
    }
  }, [skip, resetTimer])

  // Reset timer when page changes
  useEffect(() => {
    resetTimer()
  }, [location.pathname])

  if (skip || !warning) return null

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes scaleIn {
          from { opacity:0; transform:translate(-50%,-50%) scale(0.9); }
          to   { opacity:1; transform:translate(-50%,-50%) scale(1); }
        }
        @keyframes countdown {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: 126; }
        }
      `}</style>

      {/* Overlay */}
      <div style={s.overlay}>

        {/* Warning box */}
        <div style={s.box}>

          {/* Countdown ring */}
          <div style={s.ringWrap}>
            <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle cx="45" cy="45" r="38"
                fill="none" stroke="#1e3a5f" strokeWidth="6"/>
              {/* Countdown arc */}
              <circle cx="45" cy="45" r="38"
                fill="none"
                stroke={countdown <= 5 ? '#ef4444' : countdown <= 10 ? '#f59e0b' : '#378add'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="239"
                strokeDashoffset={239 - (239 * countdown / WARNING_TIME)}
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
              />
            </svg>
            <div style={s.ringNum}>
              <span style={{
                ...s.countNum,
                color: countdown <= 5 ? '#ef4444' : countdown <= 10 ? '#f59e0b' : '#6eb6ff'
              }}>
                {countdown}
              </span>
            </div>
          </div>

          {/* Text */}
          <p style={s.title}>Still there?</p>
          <p style={s.subtitle}>
            Returning to home screen in{' '}
            <strong style={{ color: countdown <= 5 ? '#ef4444' : '#6eb6ff' }}>
              {countdown} second{countdown !== 1 ? 's' : ''}
            </strong>
          </p>

          {/* Continue button */}
          <button style={s.continueBtn} onClick={resetTimer}>
            ✋ Continue Session
          </button>

          {/* Go home now */}
          <button style={s.homeBtn} onClick={goToSplash}>
            🏠 Go to Home Screen
          </button>

        </div>
      </div>
    </>
  )
}

// ── Styles ────────────────────────────────────────────────────
const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(5, 10, 25, 0.88)',
    backdropFilter: 'blur(6px)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.4s ease',
  },
  box: {
    background: '#0f2040',
    border: '1px solid #1e3a5f',
    borderRadius: '24px',
    padding: '48px 56px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    animation: 'scaleIn 0.3s ease',
    minWidth: '420px',
  },
  ringWrap: {
    position: 'relative',
    width: '90px',
    height: '90px',
    marginBottom: '8px',
  },
  ringNum: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countNum: {
    fontSize: '28px',
    fontWeight: '700',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    transition: 'color 0.3s',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'white',
    margin: 0,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  subtitle: {
    fontSize: '16px',
    color: '#8ab4d8',
    margin: 0,
    textAlign: 'center',
    lineHeight: 1.6,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  continueBtn: {
    marginTop: '8px',
    background: '#378add',
    border: 'none',
    borderRadius: '14px',
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
    padding: '16px 48px',
    cursor: 'pointer',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    width: '100%',
    boxShadow: '0 4px 20px rgba(55,138,221,0.4)',
  },
  homeBtn: {
    background: 'transparent',
    border: '1px solid #1e3a5f',
    borderRadius: '14px',
    color: '#4a7fb5',
    fontSize: '15px',
    padding: '12px 48px',
    cursor: 'pointer',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    width: '100%',
  },
}
