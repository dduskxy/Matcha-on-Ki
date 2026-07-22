import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const { active, progress } = useProgress();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Keep loading screen up slightly longer after 100% to allow Three.js
    // to compile shaders and prevent a massive stutter during the fade-out.
    if (!active && progress === 100) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "linear" }}
          style={{ willChange: "opacity" }}
          className="fixed inset-0 z-[9999] bg-luxury-cream flex flex-col items-center justify-center cursor-wait"
        >
          <div className="overflow-hidden mb-6">
            <motion.h1 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
              style={{ willChange: "transform" }}
              className="text-4xl font-serif tracking-widest text-luxury-charcoal uppercase"
            >
              Matcha no Ki
            </motion.h1>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            style={{ willChange: "opacity" }}
            className="flex flex-col items-center gap-4"
          >
            <div className="text-[10px] tracking-[0.4em] uppercase text-luxury-charcoal/60">
              Brewing...
            </div>
            {/* Ultra Minimal progress bar */}
            <div className="w-12 h-[1px] bg-luxury-charcoal/5 relative overflow-hidden mt-2">
              <motion.div 
                className="absolute top-0 left-0 h-full w-full bg-luxury-matcha/80 origin-left"
                style={{ willChange: "transform" }}
                animate={{ scaleX: progress / 100 }}
                transition={{ ease: "easeOut", duration: 0.3 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
