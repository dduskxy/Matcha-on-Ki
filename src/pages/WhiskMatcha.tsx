import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Play, Award, AlertTriangle, RotateCcw, Sparkles, RefreshCw } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { audio } from '../utils/audio';

const WhiskMatcha = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [score, setScore] = useState(0); // Only used for UI text
  const [timeLeft, setTimeLeft] = useState(10);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const hasMotion = useRef(false);
  const hasOrientation = useRef(false);
  const scoreRef = useRef(0);
  const milestoneRef = useRef(0);
  
  // Motion Values for 120 FPS buttery smooth animations (bypasses React state)
  const scoreMV = useMotionValue(0);
  const smoothScore = useSpring(scoreMV, { stiffness: 60, damping: 15, mass: 0.5 });
  
  const auraOpacity = useTransform(smoothScore, [0, 300], [0, 0.4]);
  const auraScale = useTransform(smoothScore, [0, 1000], [1, 1.25]);
  const bowlRotate = useTransform(smoothScore, v => v * 1.5);
  const frothHeight = useTransform(smoothScore, v => `${Math.min(15 + (v / 2.5), 100)}%`);
  const frothOpacity = useTransform(smoothScore, v => 0.85 + Math.min(v / 1000, 0.15));
  const whiskRotate = useTransform(smoothScore, v => -v * 3);
  
  // Advanced Sensor Physics Refs
  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  const lastTilt = useRef({ beta: 0, gamma: 0 });
  const steadyTiltRef = useRef(0);
  const lastAudioTime = useRef(0);
  
  const addItem = useCartStore(state => state.addItem);
  
  const startGame = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const motionPermission = await (DeviceMotionEvent as any).requestPermission();
        if (motionPermission !== 'granted') {
          setError("Permission to access device motion is required.");
          return;
        }
      } catch (e) {
        console.error(e);
        setError("Error requesting device motion permission.");
        return;
      }
    }
    
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const orientationPermission = await (DeviceOrientationEvent as any).requestPermission();
        if (orientationPermission !== 'granted') {
          setError("Permission to access device orientation is required.");
          return;
        }
      } catch (e) {
        console.error(e);
        setError("Error requesting device orientation permission.");
        return;
      }
    }

    setHasStarted(true);
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(10);
    setIsFinished(false);
    setError(null);
    hasMotion.current = false;
    hasOrientation.current = false;
    scoreRef.current = 0;
    scoreMV.set(0);
    milestoneRef.current = 0;
    steadyTiltRef.current = 0;
  };

  useEffect(() => {
    if (!isPlaying) return;

    // Optimized Handle Motion (Using MotionValue directly)
    const handleMotion = (event: DeviceMotionEvent) => {
      hasMotion.current = true;
      const { accelerationIncludingGravity } = event;
      if (!accelerationIncludingGravity) return;
      
      const { x, y, z } = accelerationIncludingGravity;
      
      const dx = (x || 0) - lastAccel.current.x;
      const dy = (y || 0) - lastAccel.current.y;
      const dz = (z || 0) - lastAccel.current.z;
      
      const jerkMagnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      const maxAxisJerk = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
      const isMultiAxis = maxAxisJerk < jerkMagnitude * 0.9; 
      
      if (jerkMagnitude > 12 && isMultiAxis) {
        if (steadyTiltRef.current > 5) {
          const postureMultiplier = Math.min(1.5, 1 + steadyTiltRef.current * 0.01);
          const intensity = (jerkMagnitude - 10) * 0.15;
          scoreRef.current += intensity * postureMultiplier;
          
          // Instantly sync visual state (Runs outside React render cycle)
          scoreMV.set(scoreRef.current);
          
          const now = Date.now();
          if (now - lastAudioTime.current > 150) { 
            if (navigator.vibrate) navigator.vibrate(Math.min(10 + intensity * 10, 40));
            audio.playWhiskSwish(intensity);
            lastAudioTime.current = now;
          }
        }
      }
      
      lastAccel.current = { x: x || 0, y: y || 0, z: z || 0 };
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      hasOrientation.current = true;
      const { beta, gamma } = event;
      if (beta === null || gamma === null) return;
      
      const isProperTilt = beta > 20 && beta < 70 && Math.abs(gamma) < 40;
      
      const dBeta = Math.abs(beta - lastTilt.current.beta);
      const dGamma = Math.abs(gamma - lastTilt.current.gamma);
      
      if (isProperTilt && dBeta < 15 && dGamma < 15) {
        steadyTiltRef.current += 1;
        
        const now = Date.now();
        if ((dBeta > 5 || dGamma > 5) && now - lastAudioTime.current > 200) {
          if (navigator.vibrate) navigator.vibrate(15);
          audio.playBambooClick();
          lastAudioTime.current = now;
        }
      } else {
        steadyTiltRef.current = Math.max(0, steadyTiltRef.current - 3);
      }
      
      lastTilt.current = { beta, gamma };
    };

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);

    const checkSensors = setTimeout(() => {
      if (!hasMotion.current || !hasOrientation.current) {
        setIsPlaying(false);
        setError("Your device doesn't support both required sensors (Accelerometer and Gyroscope) or you're using a desktop. Both are strictly required to whisk matcha!");
      }
    }, 2000);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setIsFinished(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Reduced UI text update frequency (Better performance)
    const uiTimer = setInterval(() => {
        const currentScore = Math.floor(scoreRef.current);
        setScore(currentScore);
        
        if (currentScore >= milestoneRef.current + 50) {
          milestoneRef.current = currentScore - (currentScore % 50);
          audio.playChime();
          if (navigator.vibrate) navigator.vibrate([30, 50, 30, 50, 100]);
        }
    }, 150);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
      clearTimeout(checkSensors);
      clearInterval(timer);
      clearInterval(uiTimer);
    };
  }, [isPlaying, scoreMV]);
  
  const handleClaim = () => {
    addItem({
      id: 'matcha-master-coupon',
      name: 'Matcha Master Exclusive Drink',
      price: 0,
      jpName: '抹茶マスター',
      icon: 'matcha',
      origin: 'Secret Menu',
      brewTemp: 'Perfect',
      tastingNotes: ['Victory', 'Exclusive', 'Pure Matcha'],
      description: 'Reward for proving your whisking skills!',
      category: 'Matcha'
    });
    alert('Matcha Master Exclusive Drink added to your cart!');
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-6 max-w-4xl mx-auto flex flex-col items-center justify-center relative z-10 selection:bg-luxury-matcha/20">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-luxury-matcha rounded-full blur-[100px] mix-blend-multiply"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-[2rem] p-10 border border-luxury-stone/40 shadow-[0_20px_60px_-15px_rgba(15,17,12,0.1)] flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-luxury-cream via-luxury-matcha to-luxury-cream opacity-60" />

        <h1 className="text-4xl font-bold font-serif mb-2 text-luxury-charcoal tracking-tight">
          The Art of Whisking
        </h1>
        <p className="text-luxury-charcoal/50 font-sans text-xs tracking-[0.2em] uppercase mb-10">
          Master the Chasen
        </p>
        
        <AnimatePresence mode="wait">
          {!hasStarted && !isFinished && !error && (
            <motion.div 
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center w-full"
            >
              <p className="text-luxury-charcoal/80 text-sm leading-relaxed mb-8 px-2 font-sans">
                Experience the mindfulness of the tea ceremony. Replicate the motion of a bamboo whisk by rotating and gently shaking your device.
              </p>
              
              <div className="w-full bg-luxury-sand/50 rounded-2xl p-6 mb-10 text-left border border-luxury-stone/30">
                <h4 className="font-serif text-lg text-luxury-charcoal mb-4 italic">Sensory Requirements</h4>
                <ul className="space-y-3 text-sm text-luxury-charcoal/70">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-luxury-matcha mt-2 flex-shrink-0" />
                    <span><strong className="font-medium text-luxury-charcoal font-serif text-base">Gyroscope:</strong> To capture the smooth, circular wrist motion.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-luxury-matcha mt-2 flex-shrink-0" />
                    <span><strong className="font-medium text-luxury-charcoal font-serif text-base">Accelerometer:</strong> To register the subtle intensity of the whisk.</span>
                  </li>
                </ul>
              </div>
              
              <button 
                onClick={startGame}
                className="group relative w-full bg-luxury-matcha text-luxury-cream py-4 rounded-xl font-sans text-sm tracking-[0.15em] uppercase overflow-hidden transition-shadow shadow-md hover:shadow-xl hover:shadow-luxury-matcha/20"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center justify-center gap-3">
                  <Play size={16} className="fill-current" /> Begin Ceremony
                </span>
              </button>
            </motion.div>
          )}

          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full bg-[#FCF5F5] border border-[#F0D5D5] p-8 rounded-2xl flex flex-col items-center gap-3 text-center"
            >
              <AlertTriangle size={32} className="text-[#B34D4D] mb-2 stroke-[1.5]" />
              <p className="font-serif text-xl text-[#661A1A]">Imperfect Conditions</p>
              <p className="text-sm text-[#8C3333]/90 leading-relaxed mb-6 font-sans">{error}</p>
              <button 
                onClick={() => {setError(null); setHasStarted(false);}} 
                className="text-xs uppercase tracking-[0.15em] text-[#B34D4D] font-medium hover:text-[#661A1A] transition-colors border-b border-[#F0D5D5] hover:border-[#B34D4D] pb-1"
              >
                Return to Menu
              </button>
            </motion.div>
          )}

          {isPlaying && !error && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center w-full"
            >
              <div className="flex justify-between w-full mb-12 text-xs font-sans tracking-widest uppercase">
                <div className="flex flex-col items-start">
                  <span className="text-luxury-charcoal/40 mb-1">Time</span>
                  <span className="text-2xl font-serif text-luxury-charcoal tracking-normal">{timeLeft}s</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-luxury-charcoal/40 mb-1">Froth</span>
                  <span className="text-2xl font-serif text-luxury-matcha tracking-normal">{score}</span>
                </div>
              </div>
              
              <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
                <motion.div 
                  style={{ opacity: auraOpacity, scale: auraScale }}
                  className="absolute inset-0 bg-luxury-matcha blur-2xl rounded-full mix-blend-multiply"
                />
                
                <motion.div
                  style={{ rotate: bowlRotate }}
                  className="relative w-40 h-40 rounded-full border-[6px] border-luxury-cream bg-luxury-sand flex items-center justify-center shadow-[inset_0_4px_12px_rgba(0,0,0,0.1),0_8px_24px_rgba(15,17,12,0.08)] overflow-hidden"
                >
                  <motion.div 
                    className="absolute bottom-0 w-full bg-luxury-matcha origin-bottom"
                    style={{ height: frothHeight, opacity: frothOpacity }}
                  />
                  
                  <motion.div 
                     style={{ rotate: whiskRotate }}
                     className="absolute inset-0 flex items-center justify-center opacity-40 mix-blend-overlay"
                  >
                    <RefreshCw size={56} className="text-white" strokeWidth={1} />
                  </motion.div>
                </motion.div>
              </div>
              
              <motion.p 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="text-sm font-serif italic text-luxury-charcoal/70 tracking-wide"
              >
                Whisk with intention...
              </motion.p>
            </motion.div>
          )}

          {isFinished && !error && (
            <motion.div 
              key="finished"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center w-full"
            >
              <div className="mb-10 text-center">
                <p className="text-luxury-charcoal/40 font-sans text-xs tracking-[0.2em] uppercase mb-3">Final Quality</p>
                <h2 className="text-7xl font-serif text-luxury-charcoal font-light tracking-tighter">{score}</h2>
              </div>
              
              {score >= 200 ? (
                <div className="w-full flex flex-col items-center bg-luxury-matcha/5 p-8 rounded-2xl border border-luxury-matcha/10">
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.2, bounce: 0.4 }}
                    className="w-16 h-16 rounded-full bg-luxury-matcha flex items-center justify-center mb-6 shadow-lg shadow-luxury-matcha/20 text-luxury-cream"
                  >
                    <Award size={32} strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="text-2xl font-serif text-luxury-charcoal mb-3">Perfect Usucha</h3>
                  <p className="text-sm text-luxury-charcoal/70 mb-8 leading-relaxed font-sans">
                    An exquisite froth with a delicate jade hue. You have unlocked a secret addition to our menu.
                  </p>
                  <button 
                    onClick={handleClaim}
                    className="w-full bg-luxury-charcoal text-luxury-cream py-4 rounded-xl font-sans text-xs tracking-[0.15em] uppercase hover:bg-luxury-matcha transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} /> Claim Reward
                  </button>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-luxury-stone/20 flex items-center justify-center mb-6 text-luxury-charcoal/40">
                    <RotateCcw size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-serif text-luxury-charcoal mb-3">Uneven Froth</h3>
                  <p className="text-sm text-luxury-charcoal/60 mb-8 leading-relaxed font-sans px-2">
                    The texture lacks the silken quality of a master's touch. Continue practicing your chasen technique (200+ needed).
                  </p>
                  <button 
                    onClick={() => setHasStarted(false)}
                    className="w-full border border-luxury-stone/60 text-luxury-charcoal py-4 rounded-xl font-sans text-xs tracking-[0.15em] uppercase hover:bg-luxury-stone/20 transition-colors duration-300"
                  >
                    Begin Anew
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default WhiskMatcha;
