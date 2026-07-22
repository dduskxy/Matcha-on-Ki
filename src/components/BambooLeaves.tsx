import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function BambooLeaves() {
  const [leaves, setLeaves] = useState<Array<{ id: number; left: string; delay: number; duration: number; size: number }>>([]);

  useEffect(() => {
    // LESS IS MORE for Luxury Minimalist. Max 12 leaves.
    const newLeaves = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 20, 
      // Extremely slow and smooth floating
      duration: 25 + Math.random() * 20, 
      size: 0.6 + Math.random() * 0.8, // Slightly smaller and more delicate
    }));
    setLeaves(newLeaves);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          initial={{ y: -100, x: 0, rotate: -20, opacity: 0 }}
          animate={{ 
            y: '105vh', 
            x: [0, 60, -40, 0], // Very smooth, wide, slow swaying
            rotate: [-20, 40, -10, 20], // Subtle, slow tilting instead of spinning
            opacity: [0, 0.7, 0.7, 0] // Soft opacity
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: "easeInOut" // Smooth easing instead of linear for X/rotate
          }}
          className="absolute top-0 shadow-sm"
          style={{ 
            left: leaf.left, 
            width: `${10 * leaf.size}px`, 
            height: `${35 * leaf.size}px`,
            borderRadius: '0 100% 0 100%', 
            background: 'linear-gradient(135deg, rgba(92, 138, 71, 0.6) 0%, rgba(54, 89, 44, 0.4) 100%)', // Lower opacity for elegance
            filter: 'blur(1.5px)' // Pushed slightly out of focus to not distract
          }}
        />
      ))}
    </div>
  );
}
