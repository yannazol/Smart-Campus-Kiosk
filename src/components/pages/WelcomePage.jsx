import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import ShinyText from './ShinyText'
import smartCampusLogo from '../../assets/smart-campus-logo.png'

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x:    (((i * 37) % 100)),
  y:    (((i * 53) % 100)),
  size: 1.5 + (i % 3) * 1.2,
  dur:  6 + (i % 5) * 2.4,
  del:  (i % 7) * 0.8,
  opa:  0.15 + (i % 4) * 0.08,
}))

export default function WelcomePage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!document.getElementById('inter-font')) {
      const link = document.createElement('link')
      link.id = 'inter-font'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
      document.head.appendChild(link)
    }
  }, [])

  return (
    <div onClick={() => navigate('/home')} style={{
      background: 'linear-gradient(135deg, #040816 0%, #07182E 50%, #04111D 100%)',
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
      overflow: 'hidden',
      fontFamily: "'Inter',system-ui,sans-serif",
    }}>

      <style>{`
        @keyframes aurora1 {
          0%   { transform:translate(0%,0%) scale(1); opacity:0.5; }
          33%  { transform:translate(8%,-12%) scale(1.15); opacity:0.7; }
          66%  { transform:translate(-6%,8%) scale(0.95); opacity:0.4; }
          100% { transform:translate(0%,0%) scale(1); opacity:0.5; }
        }
        @keyframes aurora2 {
          0%   { transform:translate(0%,0%) scale(1); opacity:0.4; }
          33%  { transform:translate(-10%,6%) scale(1.1); opacity:0.6; }
          66%  { transform:translate(7%,-9%) scale(1.05); opacity:0.3; }
          100% { transform:translate(0%,0%) scale(1); opacity:0.4; }
        }
        @keyframes aurora3 {
          0%   { transform:translate(0%,0%) scale(1.05); opacity:0.3; }
          50%  { transform:translate(5%,10%) scale(0.95); opacity:0.5; }
          100% { transform:translate(0%,0%) scale(1.05); opacity:0.3; }
        }
        @keyframes float {
          0%,100% { transform:translateY(0px) translateX(0px); opacity:var(--opa); }
          25%     { transform:translateY(-18px) translateX(6px); opacity:calc(var(--opa)*1.6); }
          50%     { transform:translateY(-8px) translateX(-5px); opacity:var(--opa); }
          75%     { transform:translateY(-22px) translateX(4px); opacity:calc(var(--opa)*0.6); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); filter:blur(8px); }
          to   { opacity:1; transform:translateY(0);    filter:blur(0px); }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes scalePulse {
          0%,100% { transform:scale(1);    opacity:1; }
          50%     { transform:scale(1.04); opacity:0.5; }
        }
        @keyframes glowPulse {
          0%,100% { filter:drop-shadow(0 0 14px rgba(91,141,239,0.45)); }
          50%     { filter:drop-shadow(0 0 28px rgba(91,141,239,0.8)) drop-shadow(0 0 46px rgba(167,139,250,0.3)); }
        }
        @keyframes logoFloat {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-6px); }
        }
        @keyframes expandLine {
          from { width:0; opacity:0; }
          to   { width:80px; opacity:1; }
        }
        @keyframes scanLine {
          0%   { top:-4px; opacity:0; }
          5%   { opacity:1; }
          95%  { opacity:1; }
          100% { top:100%; opacity:0; }
        }
        @keyframes ringBreath1 {
          0%,100% { transform:scale(1);    opacity:0.3; }
          50%     { transform:scale(1.18); opacity:0.1; }
        }
        @keyframes ringBreath2 {
          0%,100% { transform:scale(1);    opacity:0.18; }
          50%     { transform:scale(1.32); opacity:0.05; }
        }
        @keyframes ringBreath3 {
          0%,100% { transform:scale(1);   opacity:0.1; }
          50%     { transform:scale(1.5); opacity:0.02; }
        }
      `}</style>

      {/* Aurora blobs — blue/indigo/purple, matching Home/MapPage/Admin */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', width:'70vw', height:'70vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(91,141,239,0.18) 0%, transparent 70%)', top:'-20%', left:'-15%', animation:'aurora1 14s ease-in-out infinite', filter:'blur(40px)' }}/>
        <div style={{ position:'absolute', width:'60vw', height:'60vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(124,124,240,0.15) 0%, transparent 70%)', bottom:'-15%', right:'-10%', animation:'aurora2 18s ease-in-out infinite', filter:'blur(50px)' }}/>
        <div style={{ position:'absolute', width:'50vw', height:'50vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)', top:'30%', right:'20%', animation:'aurora3 22s ease-in-out infinite', filter:'blur(60px)' }}/>
      </div>

      {/* Particles */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
        {PARTICLES.map(p => (
          <div key={p.id} style={{
            position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
            width:`${p.size}px`, height:`${p.size}px`, borderRadius:'50%',
            background: p.id%3===0 ? '#5B8DEF' : p.id%3===1 ? '#7C7CF0' : '#A78BFA',
            '--opa': p.opa, opacity: p.opa,
            animation:`float ${p.dur}s ease-in-out ${p.del}s infinite`,
          }}/>
        ))}
      </div>

      {/* Scan line */}
      <div style={{
        position:'absolute', left:0, right:0, height:'2px',
        background:'linear-gradient(90deg, transparent 0%, rgba(91,141,239,0.0) 10%, rgba(91,141,239,0.8) 50%, rgba(91,141,239,0.0) 90%, transparent 100%)',
        boxShadow:'0 0 12px rgba(91,141,239,0.6), 0 0 24px rgba(91,141,239,0.3)',
        zIndex:2, pointerEvents:'none',
        animation:'scanLine 2.4s cubic-bezier(0.4,0,0.6,1) 0.2s 1 forwards',
        top:'-4px',
      }}/>

      {/* Main content */}
      <div style={{ position:'relative', zIndex:1 }}>

        {/* Breathing rings + Smart Campus logo */}
        <div style={{ position:'relative', display:'inline-block', marginBottom:'1.5rem' }}>
          <div style={{ position:'absolute', inset:'-60px', borderRadius:'50%', border:'1px solid rgba(91,141,239,0.25)', animation:'ringBreath3 4s ease-in-out 0.4s infinite' }}/>
          <div style={{ position:'absolute', inset:'-38px', borderRadius:'50%', border:'1.5px solid rgba(124,124,240,0.32)', animation:'ringBreath2 4s ease-in-out 0.2s infinite' }}/>
          <div style={{ position:'absolute', inset:'-20px', borderRadius:'50%', border:'2px solid rgba(167,139,250,0.4)', animation:'ringBreath1 4s ease-in-out infinite' }}/>
          <img
            src={smartCampusLogo}
            alt="Smart Campus Navigator"
            style={{
              position:'relative', width:'120px', height:'120px', zIndex:1,
              animation:'fadeIn 0.8s ease 0.1s both, glowPulse 3s ease-in-out 1s infinite, logoFloat 5s ease-in-out 1s infinite',
            }}
          />
        </div>

        {/* Eyebrow */}
        <p style={{ fontSize:'13px', letterSpacing:'5px', color:'#9B9BF5', textTransform:'uppercase', marginBottom:'1.2rem', animation:'fadeUp 0.9s ease 0.3s both', fontFamily:"'Inter',sans-serif", fontWeight:600 }}>
          Cainta Campus
        </p>

        {/* Heading with ShinyText on "ICCT Colleges" */}
        <h1 style={{ fontSize:'54px', fontWeight:'600', margin:'0 0 0.8rem', lineHeight:1.15, animation:'fadeUp 0.9s ease 0.5s both', fontFamily:"'Inter',sans-serif", letterSpacing:'-1px' }}>
          Welcome to<br/>
          <ShinyText
            text="ICCT Colleges"
            color="#9B9BF5"
            shineColor="#ffffff"
            speed={3}
            delay={1}
            spread={30}
          />
        </h1>

        {/* Divider */}
        <div style={{ height:'2px', background:'linear-gradient(90deg, transparent, #7C7CF0, transparent)', margin:'1.2rem auto', animation:'expandLine 0.8s ease 0.9s both', width:'80px' }}/>

        {/* Subtitle */}
        <p style={{ fontSize:'17px', color:'#7fa8bd', marginBottom:'3rem', letterSpacing:'0.3px', animation:'fadeUp 0.9s ease 0.8s both', fontFamily:"'Inter',sans-serif" }}>
          Smart Campus Navigation & Concierge Kiosk
        </p>

        {/* Touch hint — glass pill, matching Home's button style */}
        <div style={{
          display:'inline-flex', alignItems:'center',
          padding:'14px 32px',
          borderRadius:'50px',
          background:'rgba(255,255,255,0.025)',
          backdropFilter:'blur(16px) saturate(160%)',
          WebkitBackdropFilter:'blur(16px) saturate(160%)',
          border:'none',
          marginTop:'0.5rem',
          animation:'fadeIn 1s ease 1.2s both, scalePulse 2.5s ease-in-out 2s infinite',
        }}>
          <ShinyText
            text="TOUCH ANYWHERE TO CONTINUE"
            color="#7fa8bd"
            shineColor="#9B9BF5"
            speed={4}
            delay={2}
            spread={40}
          />
        </div>

      </div>
    </div>
  )
}
