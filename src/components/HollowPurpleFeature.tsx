import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Phase constants ───────────────────────────────────────────────────────────
const PHASE = {
  IDLE: 0,
  CHARGING: 1,   // 0–2s  orbs appear on both sides
  CONVERGE: 2,   // 2–3s  orbs fly to center
  FLASH: 3,      // 3–3.3s white screen burst
  EXPANSION: 4,  // 3.3–8s void tears open
  TITLE: 5,      // 5s+ title text
  OUTRO: 6,      // 13s fade out
} as const;

const PURPLE_PALETTE = [
  '#c084fc','#a855f7','#9333ea','#7c3aed',
  '#d8b4fe','#e879f9','#f0abfc','#ffffff','#8b5cf6',
];

// ─── Particle canvas ──────────────────────────────────────────────────────────
function useParticleCanvas(active: boolean, phase: number) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!active || phase < PHASE.CONVERGE) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    type P = { x:number; y:number; vx:number; vy:number; size:number; color:string; life:number; maxLife:number };
    let particles: P[] = [];

    const spawn = () => {
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const a = Math.random() * Math.PI * 2;
      const spd = phase >= PHASE.EXPANSION ? Math.random() * 14 + 5 : Math.random() * 6 + 2;
      const ml = Math.random() * 90 + 40;
      particles.push({
        x: cx + (Math.random()-0.5)*80,
        y: cy + (Math.random()-0.5)*80,
        vx: Math.cos(a)*spd, vy: Math.sin(a)*spd,
        size: Math.random()*(phase >= PHASE.EXPANSION ? 5 : 3)+1,
        color: PURPLE_PALETTE[Math.floor(Math.random()*PURPLE_PALETTE.length)],
        life: 0, maxLife: ml,
      });
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const count = phase >= PHASE.EXPANSION ? 28 : 8;
      for (let i = 0; i < count; i++) spawn();
      particles = particles.filter(p => p.life < p.maxLife);
      for (const p of particles) {
        p.life++; p.x += p.vx; p.y += p.vy;
        p.vx *= 0.97; p.vy *= 0.97;
        const alpha = (1 - p.life/p.maxLife) * 0.9;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 18; ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize', resize); };
  }, [active, phase]);

  return ref;
}

// ─── Lightning canvas ─────────────────────────────────────────────────────────
function LightningCanvas({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;

    const bolt = (x1:number,y1:number,x2:number,y2:number,d:number)=>{
      if(d<=0) return;
      const mx=(x1+x2)/2+(Math.random()-.5)*70;
      const my=(y1+y2)/2+(Math.random()-.5)*70;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(mx,my); ctx.lineTo(x2,y2);
      ctx.strokeStyle=`rgba(${180+Math.random()*75},${100+Math.random()*60},255,${0.35+Math.random()*0.65})`;
      ctx.lineWidth=d*0.9; ctx.shadowBlur=18; ctx.shadowColor='#a855f7'; ctx.stroke();
      if(Math.random()>0.45){ const bx=mx+(Math.random()-.5)*130,by=my+(Math.random()-.5)*130; bolt(mx,my,bx,by,d-1); }
      bolt(x1,y1,mx,my,d-1); bolt(mx,my,x2,y2,d-1);
    };

    const loop = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const cx=canvas.width/2, cy=canvas.height/2;
      const n=2+Math.floor(Math.random()*3);
      for(let i=0;i<n;i++){
        const a=Math.random()*Math.PI*2, len=130+Math.random()*280;
        bolt(cx,cy,cx+Math.cos(a)*len,cy+Math.sin(a)*len,3);
      }
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(raf.current);
  },[active]);

  return <canvas ref={ref} className="absolute inset-0 pointer-events-none z-[22] mix-blend-screen" />;
}

// ─── Charging Orb ─────────────────────────────────────────────────────────────
const ChargingOrb = ({ side, phase }: { side:'left'|'right'; phase:number }) => {
  const isLeft = side==='left';
  const color = isLeft ? '#3b82f6' : '#ef4444';
  const glow  = isLeft ? 'rgba(59,130,246,0.9)' : 'rgba(239,68,68,0.9)';
  const xPos  = phase>=PHASE.CONVERGE ? 'calc(50vw - 40px)' : isLeft ? '8vw' : 'calc(92vw - 80px)';
  const visible = phase>=PHASE.CHARGING && phase<PHASE.FLASH;

  return (
    <motion.div
      animate={{ left: xPos, opacity: visible ? 1 : 0, scale: visible ? 1 : 0 }}
      transition={{ duration: phase>=PHASE.CONVERGE ? 0.7 : 0.4, ease:[0.76,0,0.24,1] }}
      style={{
        position:'absolute', top:'50%', marginTop:-40,
        width:80, height:80, borderRadius:'50%', zIndex:30, pointerEvents:'none',
        background:`radial-gradient(circle, white 0%, ${color} 40%, transparent 75%)`,
        boxShadow:`0 0 70px 35px ${glow}`,
      }}
    />
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const HollowPurpleFeature: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<number>(PHASE.IDLE);
  const timers = useRef<number[]>([]);

  const clear = () => timers.current.forEach(clearTimeout);
  const after = (ms:number, fn:()=>void) => { const id=window.setTimeout(fn,ms); timers.current.push(id); };

  useEffect(() => {
    const go = () => {
      clear();
      setIsActive(true); setPhase(PHASE.CHARGING);
      after(2000, () => setPhase(PHASE.CONVERGE));
      after(3000, () => setPhase(PHASE.FLASH));
      after(3350, () => setPhase(PHASE.EXPANSION));
      after(5000, () => setPhase(PHASE.TITLE));
      after(13000, () => setPhase(PHASE.OUTRO));
      after(14200, () => { setIsActive(false); setPhase(PHASE.IDLE); });
    };
    window.addEventListener('hollow-purple', go);
    return () => { window.removeEventListener('hollow-purple', go); clear(); };
  }, []);

  const particleRef = useParticleCanvas(isActive, phase);

  const rings = useMemo(() =>
    Array.from({length:6},(_,i)=>({
      delay: i*0.2,
      dur: 2.2+i*0.5,
      opacity: 0.7-i*0.1,
    })), []);

  const dismiss = () => { clear(); setIsActive(false); setPhase(PHASE.IDLE); };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="hp"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.2 } }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[99999] overflow-hidden"
        >
          {/* ── void background ── */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: phase >= PHASE.EXPANSION
                ? ['radial-gradient(ellipse at center,#200040 0%,#080012 45%,#000 100%)',
                   'radial-gradient(ellipse at center,#350070 0%,#100022 45%,#000 100%)',
                   'radial-gradient(ellipse at center,#200040 0%,#080012 45%,#000 100%)']
                : 'radial-gradient(ellipse at center,#050008 0%,#000 100%)',
            }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
          />

          {/* ── charging orbs ── */}
          <ChargingOrb side="left"  phase={phase} />
          <ChargingOrb side="right" phase={phase} />

          {/* ── white flash ── */}
          <AnimatePresence>
            {phase === PHASE.FLASH && (
              <motion.div key="flash" className="absolute inset-0 bg-white z-[45]"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0,1,1,0] }}
                transition={{ duration: 0.38, times:[0,0.15,0.55,1] }}
              />
            )}
          </AnimatePresence>

          {/* ── lightning ── */}
          <LightningCanvas active={phase >= PHASE.CONVERGE && phase < PHASE.OUTRO} />

          {/* ── particles ── */}
          <canvas ref={particleRef} className="absolute inset-0 pointer-events-none z-[24] mix-blend-screen" />

          {/* ── shockwave rings ── */}
          {phase >= PHASE.EXPANSION && rings.map((r,i) => (
            <motion.div key={`r${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                top:'50%', left:'50%', width:180, height:180,
                marginLeft:-90, marginTop:-90, zIndex:23-i,
                border:`${Math.max(0.5,2-i*0.25)}px solid rgba(168,85,247,${r.opacity})`,
                boxShadow:`0 0 ${30+i*12}px rgba(168,85,247,0.5), inset 0 0 ${18+i*8}px rgba(168,85,247,0.3)`,
              }}
              initial={{ scale: 0.4+i*0.15, opacity: 0 }}
              animate={{ scale: [0.4+i*0.15, 9+i*2], opacity: [r.opacity, 0] }}
              transition={{ duration: r.dur, delay: r.delay, ease:[0.2,0.8,0.2,1], repeat: Infinity, repeatDelay: 1.2 }}
            />
          ))}

          {/* ── central hollow orb ── */}
          {phase >= PHASE.EXPANSION && (
            <motion.div className="absolute" style={{ top:'50%', left:'50%', zIndex:35 }}
              initial={{ scale:0, x:'-50%', y:'-50%' }}
              animate={{ scale:[0,1.15,1], x:'-50%', y:'-50%' }}
              transition={{ duration:0.9, ease:[0.76,0,0.24,1] }}
            >
              <div style={{
                width:300, height:300, borderRadius:'50%',
                background:'radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(168,85,247,0.28) 35%, rgba(90,0,160,0.65) 60%, transparent 80%)',
                boxShadow:'0 0 140px 70px rgba(168,85,247,0.55), 0 0 300px 120px rgba(80,0,150,0.25)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration:4, repeat:Infinity, ease:'linear' }}
                  style={{
                    width:130, height:130, borderRadius:'50%',
                    background:'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15) 0%, rgba(147,51,234,0.9) 40%, rgba(20,0,50,0.98) 70%, #000 100%)',
                    boxShadow:'inset 0 0 40px rgba(0,0,0,0.85), 0 0 60px rgba(168,85,247,0.9)',
                    border:'1px solid rgba(200,130,255,0.4)',
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* ── scanlines ── */}
          <div className="absolute inset-0 pointer-events-none z-[38]"
            style={{ backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)' }}
          />

          {/* ── vignette ── */}
          <div className="absolute inset-0 pointer-events-none z-[37]"
            style={{ background:'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.88) 100%)' }}
          />

          {/* ── title ── */}
          <AnimatePresence>
            {phase >= PHASE.TITLE && (
              <motion.div key="title"
                className="absolute inset-0 flex flex-col items-center justify-end pb-16 z-50 pointer-events-none"
              >
                {/* 虚式 */}
                <motion.p
                  initial={{ opacity:0, y:20, filter:'blur(8px)' }}
                  animate={{ opacity:1, y:0, filter:'blur(0px)' }}
                  exit={{ opacity:0 }}
                  transition={{ duration:0.8, delay:0.3 }}
                  style={{
                    color:'rgba(216,180,254,0.7)',
                    letterSpacing:'0.5em',
                    fontFamily:"'Noto Serif JP', serif",
                    fontSize:'0.9rem',
                    textShadow:'0 0 30px rgba(168,85,247,0.9)',
                    marginBottom:'0.8rem',
                    fontWeight:300,
                  }}
                >
                  虚式
                </motion.p>

                {/* Main text */}
                <motion.h2
                  initial={{ opacity:0, y:35, scaleX:0.82, filter:'blur(18px)' }}
                  animate={{ opacity:1, y:0, scaleX:1, filter:'blur(0px)' }}
                  exit={{ opacity:0, filter:'blur(20px)' }}
                  transition={{ duration:1.1, ease:[0.76,0,0.24,1] }}
                  className="text-center leading-tight uppercase"
                  style={{
                    fontFamily:"'Cormorant Garamond', serif",
                    fontWeight:900,
                    fontSize:'clamp(2.5rem,8vw,6rem)',
                    letterSpacing:'0.1em',
                    background:'linear-gradient(135deg,#c084fc 0%,#e879f9 25%,#fff 50%,#f0abfc 75%,#a855f7 100%)',
                    WebkitBackgroundClip:'text',
                    WebkitTextFillColor:'transparent',
                    backgroundClip:'text',
                    filter:'drop-shadow(0 0 28px rgba(168,85,247,1)) drop-shadow(0 0 60px rgba(168,85,247,0.5))',
                  }}
                >
                  Hollow Technique:<br/>
                  <motion.span
                    animate={{ backgroundPosition:['200% center','-200% center'] }}
                    transition={{ duration:2.5, repeat:Infinity, ease:'linear' }}
                    style={{
                      background:'linear-gradient(90deg,#d8b4fe,#fff,#a855f7,#fff,#d8b4fe)',
                      WebkitBackgroundClip:'text',
                      WebkitTextFillColor:'transparent',
                      backgroundClip:'text',
                      backgroundSize:'200%',
                    }}
                  >
                    Purple
                  </motion.span>
                </motion.h2>

                {/* underline glow */}
                <motion.div
                  initial={{ scaleX:0, opacity:0 }}
                  animate={{ scaleX:1, opacity:1 }}
                  exit={{ scaleX:0, opacity:0 }}
                  transition={{ duration:0.8, delay:0.6 }}
                  style={{
                    width:280, height:1, marginTop:'1.5rem',
                    background:'linear-gradient(90deg,transparent,#c084fc,#fff,#c084fc,transparent)',
                    boxShadow:'0 0 22px 5px rgba(192,132,252,0.8)',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── close button ── */}
          <motion.button
            initial={{ opacity:0 }}
            animate={{ opacity:0.6 }}
            transition={{ delay:0.8 }}
            whileHover={{ opacity:1, scale:1.1 }}
            onClick={dismiss}
            className="absolute top-8 right-8 z-[9999] w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
            style={{
              background:'rgba(168,85,247,0.2)',
              border:'1px solid rgba(168,85,247,0.5)',
              backdropFilter:'blur(8px)',
              boxShadow:'0 0 20px rgba(168,85,247,0.4)',
            }}
          >
            ✕
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HollowPurpleFeature;
