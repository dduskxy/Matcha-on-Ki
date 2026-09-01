import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';

type VibeType = 'scanning' | 'matcha' | 'hojicha' | 'sakura' | 'night' | 'day';

export default function Aura() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [vibe, setVibe] = useState<VibeType>('scanning');
  const [foundSakura, setFoundSakura] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number>(0);
  
  const addItem = useCartStore(state => state.addItem);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasPermission(true);
      analyzeFrame();
    } catch (err) {
      console.error(err);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const analyzeFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx || video.videoWidth === 0) {
      requestRef.current = requestAnimationFrame(analyzeFrame);
      return;
    }

    // Draw video to canvas (scaled down for performance)
    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let totalBrightness = 0;
    let greenCount = 0;
    let brownCount = 0;
    let pinkCount = 0;
    
    for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      
      // Luminance
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      totalBrightness += luma;
      
      // Color detection heuristics
      if (g > r * 1.2 && g > b * 1.2) greenCount++; // Green dominant
      else if (r > g * 1.2 && r > b * 1.2 && r < 200) brownCount++; // Earthy/Brown
      else if (r > 150 && g < 150 && b < 150) pinkCount++; // Red/Pinkish
      else if (r > 200 && g > 150 && b > 150 && r > g + 20) pinkCount++; // Light Pink
    }
    
    const avgBrightness = totalBrightness / (data.length / 16);
    
    // Sakura detection (AR Petal drop)
    if (pinkCount > 50 && !foundSakura) {
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
        brewTemp: 'Ambient'
      });
    }
    
    // Determine vibe (smooth out over time in a real app, but instant here)
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
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center text-center space-y-8 max-w-lg mx-auto mt-32"
        >
          <div className="w-24 h-24 rounded-full border border-luxury-charcoal/20 flex items-center justify-center mb-4">
            <span className="text-3xl">👁️</span>
          </div>
          <h1 className="font-serif text-3xl text-luxury-charcoal uppercase tracking-widest">Matcha Oracle</h1>
          <p className="text-luxury-charcoal/60 font-light leading-relaxed">
            Allow camera access to analyze your environment's colors and lighting. We will craft the perfect bespoke recommendation based on your current aura.
          </p>
          <button 
            onClick={startCamera}
            className="px-8 py-3 bg-luxury-charcoal text-luxury-cream text-[10px] tracking-[0.3em] uppercase hover:bg-luxury-matcha transition-colors"
          >
            Reveal My Aura
          </button>
        </motion.div>
      );
    }
    
    if (hasPermission === false) {
      return (
        <div className="text-center mt-32">
          <p>Camera access denied. We cannot read your aura.</p>
        </div>
      );
    }
    
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="w-full flex flex-col items-center mt-20 px-4"
      >
        {/* AR Viewport */}
        <div className="relative w-full max-w-sm aspect-[3/4] rounded-t-full overflow-hidden border-4 border-white shadow-2xl mb-12">
          <video 
            ref={videoRef} 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          {/* Scanning Overlay */}
          <motion.div 
            animate={{ y: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-full h-1 bg-white/50 shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10"
          />
          
          {/* AR Sakura Effect */}
          <AnimatePresence>
            {foundSakura && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-pink-500/20 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ rotate: 360, y: [0, -20, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl drop-shadow-lg"
                >
                  🌸
                </motion.div>
                <p className="text-white font-serif tracking-widest mt-4 drop-shadow-md">SAKURA FOUND</p>
                <p className="text-white/80 text-xs mt-2">Reward added to cart</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Oracle Recommendation */}
        <div className="text-center space-y-4">
          <p className="text-[10px] tracking-[0.4em] uppercase text-luxury-charcoal/50">Current Aura Analysis</p>
          <div className="h-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={vibe}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="font-serif text-2xl text-luxury-charcoal tracking-wide"
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
        
        {/* Hidden Canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen pt-32 pb-20 transition-colors duration-1000 ${
      vibe === 'night' ? 'bg-[#2A2B2A] text-white' : 
      vibe === 'sakura' || foundSakura ? 'bg-[#FFF0F5]' : 
      'bg-luxury-cream'
    }`}>
      {renderContent()}
    </div>
  );
}
