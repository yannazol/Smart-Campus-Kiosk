import { useNavigate } from 'react-router-dom'

export default function WelcomePage() {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate('/home')}
      style={{
        background: '#0a1628',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        cursor: 'pointer',
        textAlign: 'center',
        padding: '2rem',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{
          fontSize: '14px',
          letterSpacing: '4px',
          color: '#6eb6ff',
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}>
          ICCT Colleges
        </p>

        <h1 style={{
          fontSize: '52px',
          fontWeight: '700',
          margin: '0 0 1rem',
          lineHeight: 1.2,
        }}>
          Welcome to<br />ICCT Colleges
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#8ca8cc',
          marginBottom: '3rem',
        }}>
          Smart Campus Navigation & Concierge Kiosk
        </p>

        <p style={{
          marginTop: '1.5rem',
          fontSize: '14px',
          color: '#4a7fb5',
          letterSpacing: '2px',
          animation: 'pulse 2s infinite',
        }}>
          Touch anywhere to continue
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}