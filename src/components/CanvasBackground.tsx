import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Float, ContactShadows, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import BambooLeaves from './BambooLeaves';

const ZenStones = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.position.y = -0.5 + Math.sin(_.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]} scale={1.4}>
      <mesh position={[0, -0.6, 0]} rotation={[0.1, 0, -0.1]} scale={[1.8, 0.7, 1.6]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.8} metalness={0.2} />
      </mesh>
      
      <mesh position={[0.1, 0.3, 0.1]} rotation={[-0.2, 0.5, 0.2]} scale={[1.2, 0.5, 1.1]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#36592C" roughness={0.3} metalness={0.3} />
      </mesh>

      <mesh position={[-0.1, 0.9, 0]} rotation={[0.2, -0.2, 0.1]} scale={[0.7, 0.4, 0.6]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.7} metalness={0.2} />
      </mesh>
    </group>
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
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      ringRef.current.scale.setScalar(scale);
      ringRef2.current.scale.setScalar(scale * 1.2);
    }
  });

  return (
    <group position={[0, -2.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ringRef}>
        <ringGeometry args={[4, 4.02, 32]} />
        <meshBasicMaterial color="#4A7A3A" transparent opacity={0.3} side={THREE.FrontSide} />
      </mesh>
      <mesh ref={ringRef2}>
        <ringGeometry args={[5, 5.01, 32]} />
        <meshBasicMaterial color="#4A7A3A" transparent opacity={0.15} side={THREE.FrontSide} />
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
      <Canvas 
        camera={{ position: [0, 0, 7], fov: 45 }} 
        dpr={[1, 1]} 
        performance={{ min: 0.5 }}
        gl={{ antialias: false, stencil: false, depth: true, powerPreference: "high-performance" }}
        raycaster={{ enabled: false }}
      >
        
        {/* Simplified Lighting */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 15, 10]} intensity={4} color="#FFFFFF" />
        
        {/* Minimal Particles */}
        <Sparkles count={20} scale={15} size={2} speed={0.2} opacity={0.5} color="#4A7A3A" />

        {/* Fantasy Zen Bamboo Leaves */}
        <BambooLeaves count={15} />

        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2 - 0.2}
          maxPolarAngle={Math.PI / 2 + 0.2}
          minAzimuthAngle={-0.5}
          maxAzimuthAngle={0.5}
          enableDamping={false}
        />
        
        <ZenStones />
        <ZenRipple />
        
        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={25} blur={1} far={4.5} resolution={128} frames={1} />
      </Canvas>
    </motion.div>
  );
}
