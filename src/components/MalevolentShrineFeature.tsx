import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PHASE = {
  IDLE: 0,
  CURSED_ENERGY: 1,  // 0–1.5s dark energy builds up
  SLASH: 2,          // 1.5–2.5s black flash slash across screen
  EXPANSION: 3,      // 2.5–8s shrine tears open
  TITLE: 4,          // 4s+ title text
  OUTRO: 5,
} as const;

const RED_PALETTE = ['#ef4444','#dc2626','#b91c1c','#f87171','#fca5a5','#fff','#fbbf24','#7f1d1d'];

// Slash canvas
function SlashCanvas({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let frame = 0;
    const totalFrames = 24;
    const cx = canvas.width / 2, cy = canvas.height / 2;

    const drawSlash = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = frame / totalFrames;
      if (t < 1) {
        const len = t * Math.max(canvas.width, canvas.height) * 1.5;
        const count = 3;
        for (let i = 0; i < count; i++) {
          const angle = (-0.3 + i * 0.22);
          const alpha = (1 - t) * (0.6 - i * 0.15);
          const w = (6 - i * 1.5) * (1 - t * 0.5);
          ctx.beginPath();
          ctx.moveTo(cx - Math.cos(angle) * len, cy - Math.sin(angle) * len);
          ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
          ctx.strokeStyle = `rgba(${i===0?'239,68,68':i===1?'220,38,38':'185,28,28'},${alpha})`;
          ctx.lineWidth = w;
          ctx.shadowBlur = 30;
          ctx.shadowColor = '#ef4444';
          ctx.stroke();
        }
        frame++;
        raf.current = requestAnimationFrame(drawSlash);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    raf.current = requestAnimationFrame(drawSlash);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  return <canvas ref={ref} className="absolute inset-0 pointer-events-none z-[30] mix-blend-screen" />;
}

// Particle engine — cursed energy / ash / bone fragments
function useAshParticles(active: boolean, phase: number) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!active || phase < PHASE.EXPANSION) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;

    type P = { x:number;y:number;vx:number;vy:number;size:number;color:string;life:number;maxLife:number;shape:'circle'|'shard' };
    let particles: P[] = [];

    const spawn = () => {
      const cx = canvas.width/2, cy = canvas.height/2;
      const a = Math.random() * Math.PI * 2;
      const spd = Math.random() * 10 + 3;
      const ml = Math.random() * 100 + 50;
      particles.push({
        x: cx + (Math.random()-0.5)*120,
        y: cy + (Math.random()-0.5)*120,
        vx: Math.cos(a)*spd, vy: Math.sin(a)*spd,
        size: Math.random()*6+1,
        color: RED_PALETTE[Math.floor(Math.random()*RED_PALETTE.length)],
        life: 0, maxLife: ml,
        shape: Math.random() > 0.5 ? 'circle' : 'shard',
      });
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 22; i++) spawn();
      particles = particles.filter(p => p.life < p.maxLife);
      for (const p of particles) {
        p.life++; p.x += p.vx; p.y += p.vy;
        p.vx *= 0.96; p.vy *= 0.96;
        const alpha = (1 - p.life/p.maxLife) * 0.85;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 15; ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        } else {
          ctx.translate(p.x, p.y); ctx.rotate(p.life * 0.15);
          ctx.fillRect(-p.size/2, -p.size*1.5, p.size, p.size*3);
        }
        ctx.restore();
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf.current); };
  }, [active, phase]);

  return ref;
}

export const MalevolentShrineFeature: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<number>(PHASE.IDLE);
  const timers = useRef<number[]>([]);

  const clear = () => timers.current.forEach(clearTimeout);
  const after = (ms: number, fn: () => void) => { const id = window.setTimeout(fn, ms); timers.current.push(id); };

  useEffect(() => {
    const go = () => {
      clear();
      setIsActive(true); setPhase(PHASE.CURSED_ENERGY);
      after(1500, () => setPhase(PHASE.SLASH));
      after(2500, () => setPhase(PHASE.EXPANSION));
      after(4000, () => setPhase(PHASE.TITLE));
      after(13000, () => setPhase(PHASE.OUTRO));
      after(14200, () => { setIsActive(false); setPhase(PHASE.IDLE); });
    };
    window.addEventListener('malevolent-shrine', go);
    return () => { window.removeEventListener('malevolent-shrine', go); clear(); };
  }, []);

  const ashRef = useAshParticles(isActive, phase);
  const dismiss = () => { clear(); setIsActive(false); setPhase(PHASE.IDLE); };

  // Crack lines radiating from center
  const cracks = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * 360 + Math.random() * 20,
      length: 25 + Math.random() * 35,
      delay: i * 0.08,
    })), []);

  const rings = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      delay: i * 0.25, dur: 2 + i * 0.4, opacity: 0.7 - i * 0.1,
    })), []);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="ms"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.5 } }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[99999] overflow-hidden"
        >
          {/* void background — dark red/black */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: phase >= PHASE.EXPANSION
                ? ['radial-gradient(ellipse at center,#3b0000 0%,#0f0000 45%,#000 100%)',
                   'radial-gradient(ellipse at center,#5b0000 0%,#1a0000 45%,#000 100%)',
                   'radial-gradient(ellipse at center,#3b0000 0%,#0f0000 45%,#000 100%)']
                : 'radial-gradient(ellipse at center,#0a0000 0%,#000 100%)',
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          />

          {/* cursed energy wisps at startup */}
          {phase === PHASE.CURSED_ENERGY && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-[20]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 6, height: 6,
                    background: `radial-gradient(circle,${i%2===0?'#ef4444':'#fbbf24'},transparent)`,
                    boxShadow: `0 0 12px ${i%2===0?'#ef4444':'#dc2626'}`,
                  }}
                  animate={{
                    x: [0, (Math.cos(i/12*Math.PI*2)*120)],
                    y: [0, (Math.sin(i/12*Math.PI*2)*120)],
                    opacity: [0, 0.9, 0],
                  }}
                  transition={{ duration: 1.2, delay: i*0.08, repeat: Infinity, repeatDelay: 0.3 }}
                />
              ))}
            </motion.div>
          )}

          {/* slash */}
          <SlashCanvas active={phase >= PHASE.SLASH && phase < PHASE.EXPANSION} />

          {/* black flash overlay */}
          <AnimatePresence>
            {phase === PHASE.SLASH && (
              <motion.div key="bf" className="absolute inset-0 bg-black z-[45]"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.95, 0.95, 0] }}
                transition={{ duration: 0.4, times: [0,0.1,0.5,1] }}
              />
            )}
          </AnimatePresence>

          {/* ash particles */}
          <canvas ref={ashRef} className="absolute inset-0 pointer-events-none z-[24] mix-blend-screen" />

          {/* shockwave rings — red */}
          {phase >= PHASE.EXPANSION && rings.map((r, i) => (
            <motion.div key={`cr${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                top:'50%', left:'50%', width:200, height:200,
                marginLeft:-100, marginTop:-100, zIndex:23-i,
                border:`${Math.max(0.5,2-i*0.3)}px solid rgba(239,68,68,${r.opacity})`,
                boxShadow:`0 0 ${28+i*10}px rgba(220,38,38,0.5)`,
              }}
              initial={{ scale: 0.3+i*0.1, opacity: 0 }}
              animate={{ scale: [0.3+i*0.1, 10+i*2], opacity: [r.opacity, 0] }}
              transition={{ duration: r.dur, delay: r.delay, ease:[0.2,0.8,0.2,1], repeat:Infinity, repeatDelay:1.5 }}
            />
          ))}

          {/* central shrine gate — torii silhouette using CSS */}
          {phase >= PHASE.EXPANSION && (
            <motion.div
              className="absolute pointer-events-none"
              style={{ top:'50%', left:'50%', zIndex:35 }}
              initial={{ scale: 0, x:'-50%', y:'-50%', opacity: 0 }}
              animate={{ scale:[0,1.1,1], x:'-50%', y:'-50%', opacity:1 }}
              transition={{ duration:0.9, ease:[0.76,0,0.24,1] }}
            >
              {/* Outer glow orb */}
              <div style={{
                width:340, height:340, borderRadius:'50%',
                background:'radial-gradient(circle, rgba(255,50,0,0.06) 0%, rgba(239,68,68,0.22) 35%, rgba(120,0,0,0.6) 60%, transparent 80%)',
                boxShadow:'0 0 150px 80px rgba(220,38,38,0.5), 0 0 320px 120px rgba(100,0,0,0.2)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                {/* Spinning cursed energy sphere */}
                <motion.div
                  animate={{ rotate:-360 }}
                  transition={{ duration:3, repeat:Infinity, ease:'linear' }}
                  style={{
                    width:140, height:140, borderRadius:'50%',
                    background:'radial-gradient(circle at 40% 30%, rgba(255,100,0,0.2) 0%, rgba(180,0,0,0.9) 50%, #000 80%)',
                    boxShadow:'inset 0 0 40px rgba(0,0,0,0.9), 0 0 60px rgba(220,38,38,0.9)',
                    border:'1px solid rgba(239,100,100,0.5)',
                  }}
                />
              </div>

              {/* Crack lines radiating */}
              {phase >= PHASE.EXPANSION && cracks.map((crack, i) => (
                <motion.div key={`crack${i}`}
                  className="absolute pointer-events-none origin-left"
                  style={{
                    top:'50%', left:'50%',
                    width:`${crack.length}vw`,
                    height:1,
                    background:'linear-gradient(90deg,rgba(239,68,68,0.8),transparent)',
                    transform:`rotate(${crack.angle}deg)`,
                    transformOrigin:'0 0',
                    zIndex:32,
                  }}
                  initial={{ scaleX:0, opacity:0 }}
                  animate={{ scaleX:1, opacity:[0,0.8,0.4] }}
                  transition={{ duration:0.5, delay:crack.delay }}
                />
              ))}
            </motion.div>
          )}

          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none z-[38]"
            style={{ backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)' }}
          />
          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none z-[37]"
            style={{ background:'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.92) 100%)' }}
          />

          {/* TITLE */}
          <AnimatePresence>
            {phase >= PHASE.TITLE && (
              <motion.div key="mstitle"
                className="absolute inset-0 flex flex-col items-center justify-end pb-16 z-50 pointer-events-none"
              >
                {/* 御廚子 */}
                <motion.p
                  initial={{ opacity:0, y:20, filter:'blur(8px)' }}
                  animate={{ opacity:1, y:0, filter:'blur(0px)' }}
                  exit={{ opacity:0 }}
                  transition={{ duration:0.8, delay:0.3 }}
                  style={{
                    color:'rgba(252,165,165,0.75)',
                    letterSpacing:'0.5em',
                    fontFamily:"'Noto Serif JP', serif",
                    fontSize:'0.9rem',
                    textShadow:'0 0 30px rgba(239,68,68,0.9)',
                    marginBottom:'0.8rem',
                    fontWeight:300,
                  }}
                >
                  領域展開・御廚子
                </motion.p>

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
                    background:'linear-gradient(135deg,#fca5a5 0%,#ef4444 25%,#fff 50%,#fca5a5 75%,#dc2626 100%)',
                    WebkitBackgroundClip:'text',
                    WebkitTextFillColor:'transparent',
                    backgroundClip:'text',
                    filter:'drop-shadow(0 0 28px rgba(239,68,68,1)) drop-shadow(0 0 60px rgba(220,38,38,0.5))',
                  }}
                >
                  Domain Expansion:<br/>
                  <motion.span
                    animate={{ backgroundPosition:['200% center','-200% center'] }}
                    transition={{ duration:2, repeat:Infinity, ease:'linear' }}
                    style={{
                      background:'linear-gradient(90deg,#fca5a5,#fff,#ef4444,#fff,#fca5a5)',
                      WebkitBackgroundClip:'text',
                      WebkitTextFillColor:'transparent',
                      backgroundClip:'text',
                      backgroundSize:'200%',
                    }}
                  >
                    Malevolent Shrine
                  </motion.span>
                </motion.h2>

                <motion.div
                  initial={{ scaleX:0, opacity:0 }}
                  animate={{ scaleX:1, opacity:1 }}
                  exit={{ scaleX:0, opacity:0 }}
                  transition={{ duration:0.8, delay:0.6 }}
                  style={{
                    width:280, height:1, marginTop:'1.5rem',
                    background:'linear-gradient(90deg,transparent,#ef4444,#fff,#ef4444,transparent)',
                    boxShadow:'0 0 22px 5px rgba(239,68,68,0.8)',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* close */}
          <motion.button
            initial={{ opacity:0 }} animate={{ opacity:0.6 }} transition={{ delay:0.8 }}
            whileHover={{ opacity:1, scale:1.1 }}
            onClick={dismiss}
            className="absolute top-8 right-8 z-[9999] w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
            style={{
              background:'rgba(239,68,68,0.2)',
              border:'1px solid rgba(239,68,68,0.5)',
              backdropFilter:'blur(8px)',
              boxShadow:'0 0 20px rgba(220,38,38,0.4)',
            }}
          >
            ✕
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MalevolentShrineFeature;
