import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Float, Environment, ContactShadows, Sparkles, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

const ZenStones = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Extremely slow, meditative rotation (base auto-rotation)
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
      <group ref={groupRef} position={[0, -0.5, 0]} scale={1.4}>
        {/* Base Stone (Charcoal) */}
        <mesh position={[0, -0.6, 0]} rotation={[0.1, 0, -0.1]} scale={[1.8, 0.7, 1.6]}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.8} metalness={0.2} />
        </mesh>
        
        {/* Middle Stone (Matcha / Jade) */}
        <mesh position={[0.1, 0.3, 0.1]} rotation={[-0.2, 0.5, 0.2]} scale={[1.2, 0.5, 1.1]}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshStandardMaterial color="#36592C" roughness={0.3} metalness={0.3} />
        </mesh>

        {/* Top Stone (Charcoal) */}
        <mesh position={[-0.1, 0.9, 0]} rotation={[0.2, -0.2, 0.1]} scale={[0.7, 0.4, 0.6]}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.7} metalness={0.2} />
        </mesh>
      </group>
    </Float>
  );
};

// Grand Zen Ripple Effect
const ZenRipple = () => {
  const ringRef = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (ringRef.current && ringRef2.current) {
      ringRef.current.rotation.z -= delta * 0.02;
      ringRef2.current.rotation.z += delta * 0.03;
      // Gentle pulsing
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      ringRef.current.scale.setScalar(scale);
      ringRef2.current.scale.setScalar(scale * 1.2);
    }
  });

  return (
    <group position={[0, -2.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ringRef}>
        <ringGeometry args={[4, 4.02, 64]} />
        <meshBasicMaterial color="#4A7A3A" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ringRef2}>
        <ringGeometry args={[5, 5.01, 64]} />
        <meshBasicMaterial color="#4A7A3A" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export default function CanvasBackground() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[-10]"
    >
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 1.2]} performance={{ min: 0.5 }}>
        
        {/* Cinematic Lighting Setup */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 15, 10]} intensity={3} color="#FFFFFF" />
        <directionalLight position={[-10, -10, -10]} intensity={2} color="#F0EEE7" />
        {/* Majestic Rim Light from behind to make the stones pop */}
        <spotLight position={[0, 10, -10]} intensity={15} color="#4A7A3A" distance={30} penumbra={1} />
        
        {/* Atmosphere Particles (Komorebi / Tea Dust) */}
        <Sparkles count={120} scale={15} size={1.5} speed={0.2} opacity={0.8} color="#4A7A3A" />
        <Sparkles count={80} scale={20} size={3} speed={0.1} opacity={0.6} color="#FFFFFF" />

        {/* Interactive Premium Presentation */}
        <PresentationControls 
          global 
          zoom={1.1} 
          rotation={[0, 0, 0]} 
          polar={[-0.2, 0.2]} 
          azimuth={[-0.5, 0.5]} 
          config={{ mass: 2, tension: 400 }} 
          snap={{ mass: 4, tension: 400 }}
        >
          <ZenStones />
        </PresentationControls>
        
        <ZenRipple />
        
        <Environment preset="city" />
        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={25} blur={2.5} far={4.5} resolution={256} frames={1} />
      </Canvas>
    </motion.div>
  );
}
