import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

import { OrbitControls, Sparkles, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import BambooLeaves from './BambooLeaves';

const ZenStones = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.03;
      groupRef.current.position.y = -0.5 + Math.sin(_.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]} scale={1.3}>
      {/* Bottom Stone (Dark Basalt) */}
      <mesh position={[0, -0.8, 0]} rotation={[0.05, 0.2, -0.05]} scale={[1.7, 0.5, 1.6]} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          color="#3a3b3c" 
          roughness={0.85} 
          metalness={0.0} 
        />
      </mesh>
      
      {/* Middle Stone (Muted Jade) */}
      <mesh position={[0.05, -0.1, 0.05]} rotation={[-0.1, -0.4, 0.05]} scale={[1.4, 0.4, 1.3]} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          color="#7c8f76" 
          roughness={0.75} 
          metalness={0.0}
        />
      </mesh>

      {/* Top Stone (Warm Sandstone) */}
      <mesh position={[-0.05, 0.4, -0.05]} rotation={[0.1, 0.5, -0.1]} scale={[0.8, 0.3, 0.7]} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          color="#a8a29e" 
          roughness={0.9} 
          metalness={0.0} 
        />
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
    <div className="fixed inset-0 z-[-10]">
      <Canvas 
        camera={{ position: [0, 0, 7], fov: 45 }} 
        dpr={[1, 2]} 
        performance={{ min: 0.5 }}
        gl={{ antialias: true, stencil: false, depth: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}
        shadows
      >
        <color attach="background" args={['#0d140f']} />
        <fog attach="fog" args={['#0d140f', 5, 20]} />
        
        {/* Soft abstract environment, no heavy reflections */}
        <Environment preset="city" background={false} environmentIntensity={0.2} />
        
        {/* Sunlight breaking through canopy */}
        <ambientLight intensity={0.5} color="#1a2e20" />
        <directionalLight
          position={[10, 15, -5]}
          intensity={3}
          color="#d0f2d9"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight
          position={[-5, 5, 5]}
          intensity={1}
          color="#1e3626"
        />
        
        {/* Fireflies / Magic Dust */}
        <Sparkles count={80} scale={20} size={1.5} speed={0.4} opacity={0.6} color="#c2f0a8" />

        {/* Fantasy Zen Bamboo Leaves */}
        <BambooLeaves count={60} />

        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2 - 0.2}
          maxPolarAngle={Math.PI / 2 + 0.2}
          minAzimuthAngle={-0.5}
          maxAzimuthAngle={0.5}
          enableDamping={true}
          dampingFactor={0.05}
        />
        
        <ZenStones />
        <ZenRipple />
        
        {/* Baked Contact Shadows - Fast but realistic */}
        <ContactShadows 
          frames={1} 
          position={[0, -2.49, 0]} 
          scale={20} 
          blur={2.5} 
          opacity={0.7} 
          far={10} 
          resolution={1024} 
          color="#1a2636" 
        />
      </Canvas>
    </div>
  );
}
