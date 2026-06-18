import { useNavigate } from 'react-router-dom'
import ShinyText from './ShinyText'

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

  return (
    <div onClick={() => navigate('/home')} style={{
      background: '#040e1f',
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
          0%,100% { box-shadow:0 0 18px rgba(55,138,221,0.4); }
          50%     { box-shadow:0 0 36px rgba(55,138,221,0.8), 0 0 60px rgba(55,138,221,0.3); }
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
          0%,100% { transform:scale(1);    opacity:0.25; }
          50%     { transform:scale(1.18); opacity:0.08; }
        }
        @keyframes ringBreath2 {
          0%,100% { transform:scale(1);    opacity:0.15; }
          50%     { transform:scale(1.32); opacity:0.04; }
        }
        @keyframes ringBreath3 {
          0%,100% { transform:scale(1);   opacity:0.08; }
          50%     { transform:scale(1.5); opacity:0.02; }
        }
      `}</style>

      {/* Aurora blobs */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', width:'70vw', height:'70vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(55,138,221,0.18) 0%, transparent 70%)', top:'-20%', left:'-15%', animation:'aurora1 14s ease-in-out infinite', filter:'blur(40px)' }}/>
        <div style={{ position:'absolute', width:'60vw', height:'60vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)', bottom:'-15%', right:'-10%', animation:'aurora2 18s ease-in-out infinite', filter:'blur(50px)' }}/>
        <div style={{ position:'absolute', width:'50vw', height:'50vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(29,158,117,0.10) 0%, transparent 70%)', top:'30%', right:'20%', animation:'aurora3 22s ease-in-out infinite', filter:'blur(60px)' }}/>
      </div>

      {/* Particles */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
        {PARTICLES.map(p => (
          <div key={p.id} style={{
            position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
            width:`${p.size}px`, height:`${p.size}px`, borderRadius:'50%',
            background: p.id%3===0 ? '#378add' : p.id%3===1 ? '#6366f1' : '#1d9e75',
            '--opa': p.opa, opacity: p.opa,
            animation:`float ${p.dur}s ease-in-out ${p.del}s infinite`,
          }}/>
        ))}
      </div>

      {/* Scan line */}
      <div style={{
        position:'absolute', left:0, right:0, height:'2px',
        background:'linear-gradient(90deg, transparent 0%, rgba(55,138,221,0.0) 10%, rgba(55,138,221,0.8) 50%, rgba(55,138,221,0.0) 90%, transparent 100%)',
        boxShadow:'0 0 12px rgba(55,138,221,0.6), 0 0 24px rgba(55,138,221,0.3)',
        zIndex:2, pointerEvents:'none',
        animation:'scanLine 2.4s cubic-bezier(0.4,0,0.6,1) 0.2s 1 forwards',
        top:'-4px',
      }}/>

      {/* Main content */}
      <div style={{ position:'relative', zIndex:1 }}>

        {/* Breathing rings + logo */}
        <div style={{ position:'relative', display:'inline-block', marginBottom:'2rem' }}>
          <div style={{ position:'absolute', inset:'-52px', borderRadius:'50%', border:'1px solid rgba(55,138,221,0.2)', animation:'ringBreath3 4s ease-in-out 0.4s infinite' }}/>
          <div style={{ position:'absolute', inset:'-32px', borderRadius:'50%', border:'1.5px solid rgba(55,138,221,0.3)', animation:'ringBreath2 4s ease-in-out 0.2s infinite' }}/>
          <div style={{ position:'absolute', inset:'-16px', borderRadius:'50%', border:'2px solid rgba(55,138,221,0.45)', animation:'ringBreath1 4s ease-in-out infinite' }}/>
          <div style={{
            position:'relative', background:'#378add', color:'white',
            fontWeight:'800', fontSize:'18px', padding:'10px 24px',
            borderRadius:'12px', letterSpacing:'4px', zIndex:1,
            animation:'fadeIn 0.8s ease 0.1s both, glowPulse 3s ease-in-out 1s infinite',
          }}>
            ICCT
          </div>
        </div>

        {/* Eyebrow */}
        <p style={{ fontSize:'13px', letterSpacing:'5px', color:'#6eb6ff', textTransform:'uppercase', marginBottom:'1.2rem', animation:'fadeUp 0.9s ease 0.3s both' }}>
          Cainta Campus
        </p>

        {/* Heading with ShinyText on "ICCT Colleges" */}
        <h1 style={{ fontSize:'58px', fontWeight:'700', margin:'0 0 0.8rem', lineHeight:1.15, animation:'fadeUp 0.9s ease 0.5s both' }}>
          Welcome to<br/>
          <ShinyText
            text="ICCT Colleges"
            color="#6eb6ff"
            shineColor="#ffffff"
            speed={3}
            delay={1}
            spread={30}
          />
        </h1>

        {/* Divider */}
        <div style={{ height:'2px', background:'linear-gradient(90deg, transparent, #378add, transparent)', margin:'1.2rem auto', animation:'expandLine 0.8s ease 0.9s both', width:'80px' }}/>

        {/* Subtitle */}
        <p style={{ fontSize:'17px', color:'#8ca8cc', marginBottom:'3rem', letterSpacing:'0.5px', animation:'fadeUp 0.9s ease 0.8s both' }}>
          Smart Campus Navigation & Concierge Kiosk
        </p>

        {/* Touch hint with ShinyText */}
        <div style={{
          display:'inline-flex', alignItems:'center', gap:'10px',
          marginTop:'0.5rem', padding:'12px 28px',
          border:'1px solid #1e3a5f', borderRadius:'50px',
          animation:'fadeIn 1s ease 1.2s both, scalePulse 2.5s ease-in-out 2s infinite',
        }}>
          <span style={{ fontSize:'18px' }}>👆</span>
          <ShinyText
            text="TOUCH ANYWHERE TO CONTINUE"
            color="#4a7fb5"
            shineColor="#6eb6ff"
            speed={4}
            delay={2}
            spread={40}
          />
        </div>

      </div>
    </div>
  )
}
