import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const { active, progress, total } = useProgress();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Keep loading screen up slightly longer. If total === 0, there are no external assets to load.
    if (!active && (progress === 100 || total === 0)) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [active, progress, total]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "linear" }}
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
            className="flex flex-col items-center mt-6"
          >
            {/* Ultra Minimal progress bar */}
            <div className="w-64 h-[1px] bg-luxury-charcoal/10 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full w-full bg-luxury-charcoal origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: (total === 0 && !active) ? 1 : progress / 100 }}
                transition={{ ease: [0.76, 0, 0.24, 1], duration: 0.8 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
