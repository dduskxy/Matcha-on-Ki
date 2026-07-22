import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Float, Environment, ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const ZenStones = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Extremely slow, meditative rotation
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
      <group ref={groupRef} position={[0, -0.5, 0]}>
        {/* Base Stone (Charcoal) */}
        <mesh position={[0, -0.6, 0]} rotation={[0.1, 0, -0.1]} scale={[1.8, 0.7, 1.6]}>
          <sphereGeometry args={[1, 64, 32]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.9} metalness={0.1} />
        </mesh>
        
        {/* Middle Stone (Matcha / Jade) */}
        <mesh position={[0.1, 0.3, 0.1]} rotation={[-0.2, 0.5, 0.2]} scale={[1.2, 0.5, 1.1]}>
          <sphereGeometry args={[1, 64, 32]} />
          <meshStandardMaterial color="#36592C" roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Top Stone (Charcoal) */}
        <mesh position={[-0.1, 0.9, 0]} rotation={[0.2, -0.2, 0.1]} scale={[0.7, 0.4, 0.6]}>
          <sphereGeometry args={[1, 64, 32]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.8} metalness={0.1} />
        </mesh>
      </group>
    </Float>
  );
};


export default function CanvasBackground() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[-10] pointer-events-none"
    >
      {/* Capped pixel ratio to prevent extreme GPU usage on retina displays */}
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 15, 10]} intensity={4} color="#FFFFFF" castShadow />
        <directionalLight position={[-10, -10, -10]} intensity={2} color="#F0EEE7" />
        
        {/* Atmosphere Particles (Komorebi / Tea Dust) */}
        <Sparkles count={250} scale={15} size={1.5} speed={0.2} opacity={0.8} color="#4A7A3A" />
        <Sparkles count={150} scale={20} size={3} speed={0.1} opacity={0.6} color="#FFFFFF" />

        <ZenStones />
        
        <Environment preset="city" />
        {/* Reduced ContactShadows resolution and frequency for massive FPS boost */}
        <ContactShadows position={[0, -2.5, 0]} opacity={0.3} scale={20} blur={2.5} far={4.5} resolution={256} frames={1} />
      </Canvas>
    </motion.div>
  );
}
