import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';

type VibeType = 'scanning' | 'matcha' | 'hojicha' | 'sakura' | 'night' | 'day';

export default function Aura() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [vibe, setVibe] = useState<VibeType>('scanning');
  const [foundSakura, setFoundSakura] = useState(false);
  const foundSakuraRef = useRef(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number>(0);
  
  const addItem = useCartStore(state => state.addItem);

  const startCamera = async () => {
    try {
      let stream: MediaStream;
      try {
        // Attempt to request the environment-facing camera first
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
      } catch (err) {
        // Fallback to any available camera if 'environment' fails (e.g. PC or older device)
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
      }
      
      streamRef.current = stream;
      setHasPermission(true);
    } catch (err) {
      console.error(err);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = 0;
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Reactively handle binding the stream and starting the analysis loop 
  // once the permission is granted AND the DOM elements have mounted.
  useEffect(() => {
    if (hasPermission && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(console.error);
      
      requestRef.current = requestAnimationFrame(analyzeFrame);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPermission]);

  const analyzeFrame = () => {
    if (!videoRef.current || !canvasRef.current) {
      // Safely keep the loop alive even if refs temporarily unmount
      requestRef.current = requestAnimationFrame(analyzeFrame);
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx || video.videoWidth === 0) {
      requestRef.current = requestAnimationFrame(analyzeFrame);
      return;
    }

    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let totalBrightness = 0;
    let greenCount = 0;
    let brownCount = 0;
    let pinkCount = 0;
    
    for (let i = 0; i < data.length; i += 16) { 
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      totalBrightness += luma;
      
      if (g > r * 1.2 && g > b * 1.2) greenCount++; 
      else if (r > g * 1.2 && r > b * 1.2 && r < 200) brownCount++; 
      else if (r > 150 && g < 150 && b < 150) pinkCount++; 
      else if (r > 200 && g > 150 && b > 150 && r > g + 20) pinkCount++; 
    }
    
    const avgBrightness = totalBrightness / (data.length / 16);
    
    if (pinkCount > 50 && !foundSakuraRef.current) {
      foundSakuraRef.current = true;
      setFoundSakura(true);
      addItem({ 
        id: 'sakura-reward', 
        name: 'Hidden Sakura Ticket', 
        jpName: '桜の秘密', 
        category: 'Matcha', 
        price: 0, 
        description: 'You found the hidden Sakura aura.',
        icon: 'sweet',
        origin: 'AR Environment',
        brewTemp: 'Ambient',
        tastingNotes: ['Sakura', 'Sweet']
      });
    }
    
    if (avgBrightness < 60) setVibe('night');
    else if (avgBrightness > 200) setVibe('day');
    else if (greenCount > brownCount && greenCount > pinkCount) setVibe('matcha');
    else if (brownCount > greenCount) setVibe('hojicha');
    else if (pinkCount > 20) setVibe('sakura');
    
    requestRef.current = requestAnimationFrame(analyzeFrame);
  };

  const renderContent = () => {
    if (hasPermission === null) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="flex flex-col items-center justify-center text-center space-y-8 max-w-lg mx-auto mt-32 px-6"
        >
          <div className="w-24 h-24 rounded-full border border-luxury-charcoal/20 flex items-center justify-center mb-4 bg-white/50 backdrop-blur-sm shadow-sm">
            <span className="text-3xl opacity-80">👁️</span>
          </div>
          <h1 className="font-serif text-3xl text-luxury-charcoal uppercase tracking-widest">Matcha Oracle</h1>
          <p className="text-luxury-charcoal/60 font-light leading-relaxed">
            Allow camera access to analyze your environment's colors and lighting. We will craft the perfect bespoke recommendation based on your current aura.
          </p>
          <button 
            onClick={startCamera}
            className="px-10 py-4 mt-4 bg-luxury-charcoal text-luxury-cream text-[10px] tracking-[0.3em] uppercase hover:bg-luxury-matcha transition-colors"
          >
            Reveal My Aura
          </button>
        </motion.div>
      );
    }
    
    if (hasPermission === false) {
      return (
        <motion.div 
          initial={{ opacity: 0, filter: "blur(10px)" }} 
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center text-center space-y-10 max-w-lg mx-auto mt-24 px-6"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-luxury-charcoal/10 animate-ping opacity-20"></div>
            <div className="w-20 h-20 rounded-full border border-luxury-charcoal/30 flex items-center justify-center bg-white/50 backdrop-blur-sm shadow-sm">
              <span className="text-2xl opacity-60 font-light">✕</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="font-serif text-2xl md:text-3xl text-luxury-charcoal uppercase tracking-[0.2em]">Vision Obscured</h1>
            <p className="text-luxury-charcoal/60 font-light leading-relaxed max-w-md mx-auto">
              We cannot perceive your aura. The oracle requires a clear view of your environment to craft your bespoke recommendation.
            </p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-luxury-charcoal/20 to-transparent"></div>
          
          <div className="text-left w-full max-w-sm space-y-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-luxury-charcoal/50 text-center mb-4">
              Restoring the Connection
            </p>
            <ul className="text-xs text-luxury-charcoal/70 font-light space-y-3">
              <li className="flex items-start">
                <span className="mr-3 opacity-50 mt-0.5 font-serif">I.</span> 
                Ensure camera permissions are allowed in your browser or device settings.
              </li>
              <li className="flex items-start">
                <span className="mr-3 opacity-50 mt-0.5 font-serif">II.</span> 
                Verify you are accessing this sanctuary via a secure HTTPS connection.
              </li>
              <li className="flex items-start">
                <span className="mr-3 opacity-50 mt-0.5 font-serif">III.</span> 
                Confirm no other applications are currently engaging your camera.
              </li>
            </ul>
          </div>

          <a 
            href="/"
            className="group relative inline-flex items-center justify-center px-10 py-4 mt-8 bg-transparent text-luxury-charcoal text-[10px] tracking-[0.3em] uppercase overflow-hidden transition-all hover:text-luxury-cream border border-luxury-charcoal/20 hover:border-luxury-charcoal"
          >
            <span className="absolute inset-0 w-full h-full bg-luxury-charcoal -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
            <span className="relative z-10">Return to Home</span>
          </a>
        </motion.div>
      );
    }
    
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="w-full flex flex-col items-center mt-20 px-4"
      >
        {/* AR Viewport */}
        <div className="relative w-full max-w-sm aspect-[3/4] rounded-t-full overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] mb-12">
          <video 
            ref={videoRef} 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          
          {/* Enhanced Scanning Overlay */}
          <motion.div 
            animate={{ y: ['-100%', '400%'] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-transparent via-white/30 to-transparent blur-md z-10"
          />
          
          {/* Enhanced AR Sakura Effect */}
          <AnimatePresence>
            {foundSakura && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-pink-500/20 backdrop-blur-md"
              >
                <motion.div
                  initial={{ scale: 0.8, y: 20, rotate: -10 }}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    y: 0,
                    rotate: [0, 5, -5, 0] 
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-7xl drop-shadow-[0_0_20px_rgba(255,182,193,0.8)]"
                >
                  🌸
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="flex flex-col items-center"
                >
                  <p className="text-white font-serif tracking-[0.3em] mt-6 drop-shadow-md">SAKURA FOUND</p>
                  <p className="text-white/90 text-[10px] mt-3 uppercase tracking-widest border-t border-white/30 pt-2">Reward added to cart</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Oracle Recommendation */}
        <div className="text-center space-y-4">
          <p className="text-[10px] tracking-[0.4em] uppercase opacity-50">Current Aura Analysis</p>
          <div className="h-24 px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={vibe}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="font-serif text-2xl tracking-wide max-w-sm"
              >
                {vibe === 'scanning' && "Analyzing your environment..."}
                {vibe === 'night' && "A dim, calm atmosphere. We recommend a Warm Hojicha to soothe the soul."}
                {vibe === 'day' && "Bright and vibrant! An Iced Yuzu Matcha will refresh your spirit."}
                {vibe === 'matcha' && "Surrounded by nature. A Ceremonial Usucha resonates with this earthy energy."}
                {vibe === 'hojicha' && "Warm, earthy tones detected. Our Roasted Hojicha Latte is your perfect match."}
                {vibe === 'sakura' && "A touch of pink... The elusive Sakura Blossom blend is calling you."}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    );
  };

  const getVibeStyles = () => {
    if (foundSakura || vibe === 'sakura') return { bg: '#FFF0F5', text: '#2A2B2A' };
    switch (vibe) {
      case 'night': return { bg: '#2A2B2A', text: '#FFFFFF' };
      case 'day': return { bg: '#F9F6F0', text: '#2A2B2A' };
      case 'matcha': return { bg: '#E8EFE8', text: '#2A2B2A' };
      case 'hojicha': return { bg: '#F4ECE6', text: '#2A2B2A' };
      default: return { bg: '#F2EFE9', text: '#2A2B2A' }; 
    }
  };
  
  const currentStyles = getVibeStyles();

  return (
    <motion.div 
      animate={{ 
        backgroundColor: currentStyles.bg, 
        color: currentStyles.text 
      }}
      transition={{ duration: 2, ease: 'easeInOut' }}
      className="min-h-screen pt-32 pb-20"
    >
      {renderContent()}
    </motion.div>
  );
}
