import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const { active, progress } = useProgress();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Keep loading screen up until 3D is fully loaded and at least a minimal time has passed
    // to prevent jarring flash if it loads instantly.
    if (!active && progress === 100) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] bg-luxury-cream flex flex-col items-center justify-center cursor-wait"
        >
          <div className="overflow-hidden mb-6">
            <motion.h1 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
              className="text-4xl font-serif tracking-widest text-luxury-charcoal uppercase"
            >
              Matcha no Ki
            </motion.h1>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="text-[10px] tracking-[0.4em] uppercase text-luxury-charcoal/60">
              Brewing...
            </div>
            {/* Minimal progress bar */}
            <div className="w-32 h-[1px] bg-luxury-charcoal/10 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-luxury-matcha"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.2 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
