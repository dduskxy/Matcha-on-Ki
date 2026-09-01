import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnvironmentStore, type AtmosphereMode } from '../store/useEnvironmentStore';

export const AtmosphereLayer: React.FC = () => {
  const atmosphereMode = useEnvironmentStore((state) => state.atmosphereMode);

  const getBackground = (mode: AtmosphereMode) => {
    switch (mode) {
      case 'morning-zen':
        return 'linear-gradient(135deg, rgba(254, 243, 199, 0.4) 0%, rgba(254, 205, 211, 0.2) 100%)';
      case 'evening-chill':
        return 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(251, 146, 60, 0.1) 100%)';
      case 'night-focus':
        return 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 58, 138, 0.5) 100%)';
      case 'busy-cafe':
        return 'linear-gradient(135deg, rgba(253, 230, 138, 0.3) 0%, rgba(245, 158, 11, 0.15) 100%)';
      default:
        return 'transparent';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={atmosphereMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: getBackground(atmosphereMode),
          }}
        >
          {atmosphereMode === 'night-focus' && <Stars />}
          {atmosphereMode === 'morning-zen' && <SunGlow />}
          {atmosphereMode === 'busy-cafe' && <CafeParticles />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const Stars: React.FC = () => {
  const stars = React.useMemo(() => {
    return Array.from({ length: 30 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 4 + 3,
      opacity: Math.random() * 0.5 + 0.3,
      scale: Math.random() * 0.5 + 0.5,
    }));
  }, []);

  return (
    <>
      {stars.map((star, i) => (
        <motion.div
          key={i}
          initial={{ opacity: star.opacity, scale: star.scale }}
          animate={{
            opacity: [star.opacity, 1, star.opacity],
            scale: [star.scale, 1.2, star.scale],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            position: 'absolute',
            top: star.top,
            left: star.left,
            width: '3px',
            height: '3px',
            backgroundColor: '#fbbf24',
            borderRadius: '50%',
            boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)',
          }}
        />
      ))}
    </>
  );
};

const SunGlow: React.FC = () => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 0.6 }}
    transition={{ duration: 4, ease: 'easeOut' }}
    style={{
      position: 'absolute',
      top: '-20%',
      right: '-10%',
      width: '60vw',
      height: '60vw',
      background: 'radial-gradient(circle, rgba(253,230,138,0.4) 0%, rgba(255,255,255,0) 70%)',
      borderRadius: '50%',
    }}
  />
);

const CafeParticles: React.FC = () => {
  const particles = React.useMemo(() => {
    return Array.from({ length: 15 }).map(() => ({
      startX: `${Math.random() * 100}vw`,
      endX: `calc(${Math.random() * 100}vw + ${Math.random() * 20 - 10}vw)`,
      duration: Math.random() * 6 + 6,
      delay: Math.random() * 5,
      scale: Math.random() * 0.5 + 0.5,
    }));
  }, []);

  return (
    <>
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          initial={{ y: '100vh', x: particle.startX, opacity: 0, scale: particle.scale }}
          animate={{ y: '-10vh', opacity: [0, 0.4, 0], x: particle.endX }}
          transition={{ duration: particle.duration, repeat: Infinity, delay: particle.delay, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            backgroundColor: 'rgba(245, 158, 11, 0.3)',
            borderRadius: '50%',
            filter: 'blur(2px)',
          }}
        />
      ))}
    </>
  );
};
