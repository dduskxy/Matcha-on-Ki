import { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

import { Sparkles, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import BambooLeaves from './BambooLeaves';

function CameraRig() {
  const { camera, pointer } = useThree();
  useFrame((state, delta) => {
    // Smooth, cinematic camera drift based on time and mouse position
    const t = state.clock.getElapsedTime();
    const targetX = Math.sin(t / 8) * 0.5 + pointer.x * 0.8;
    const targetY = Math.cos(t / 6) * 0.4 + pointer.y * 0.8;
    
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, delta * 1.5);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * 1.5);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

const ZenStones = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Very subtle, smooth rotation
      groupRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
      <group ref={groupRef} position={[0, -0.5, 0]} scale={1.3}>
        {/* Bottom Stone (Deep Walnut Wood/Earth - "Ki" Element) */}
        <mesh position={[0, -0.9, 0]} rotation={[0.05, 0.4, -0.05]} scale={[1.9, 0.4, 1.8]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial 
            color="#2c1e16" 
            roughness={0.9} 
            metalness={0.0}
          />
        </mesh>
        
        {/* Middle Stone (Wabi-Sabi Ceramic Chawan - "Tea Bowl" Element) */}
        <mesh position={[0.1, -0.3, 0.05]} rotation={[-0.1, -0.2, 0.1]} scale={[1.2, 0.35, 1.1]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial 
            color="#e8e3d9" 
            roughness={0.3} 
            metalness={0.1}
          />
        </mesh>

        {/* Top Stone (Ceremonial Matcha Gem - "Matcha" Element) */}
        <mesh position={[-0.05, 0.15, -0.05]} rotation={[0.15, 0.6, -0.15]} scale={[0.6, 0.25, 0.5]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial 
            color="#4a7a3a"
            roughness={0.1}
            metalness={0.2}
          />
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
      ringRef.current.rotation.z -= delta * 0.015;
      ringRef2.current.rotation.z += delta * 0.02;
      
      // Smoother breathing effect for ripples
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.3) * 0.03;
      ringRef.current.scale.setScalar(scale);
      ringRef2.current.scale.setScalar(scale * 1.15);
    }
  });

  return (
    <group position={[0, -2.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ringRef}>
        <ringGeometry args={[4, 4.015, 48]} />
        <meshBasicMaterial color="#4A7A3A" transparent opacity={0.3} side={THREE.FrontSide} />
      </mesh>
      <mesh ref={ringRef2}>
        <ringGeometry args={[5, 5.01, 48]} />
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
        gl={{ antialias: true, stencil: false, depth: true, powerPreference: "high-performance" }}
      >
        <fog attach="fog" args={['#ffffff', 5, 20]} />
        
        {/* Cinematic 3-Point Lighting */}
        
        {/* Ambient Fill (Soft Warm Base) */}
        <ambientLight intensity={0.5} color="#f5f0e6" />
        
        {/* Key Light (Sun) - Pure white to show true colors */}
        <directionalLight
          position={[6, 12, -4]}
          intensity={2.5}
          color="#ffffff"
        />
        
        {/* Fill Light (Soft daylight) */}
        <directionalLight
          position={[-6, 6, 6]}
          intensity={0.8}
          color="#e6ecf2"
        />

        {/* Rim Light (Warm Golden Sunlight) - Highlights edges gracefully */}
        <pointLight
          position={[0, -1.5, -5]}
          intensity={2.5}
          color="#fceea7"
        />
        
        {/* Magical Ceremonial Matcha Dust (Golden/Green Mist) */}
        <Sparkles 
          count={45} 
          scale={12} 
          size={5} 
          speed={0.15} 
          opacity={0.2} 
          noise={0.3}
          color="#fceea7" 
        />
        
        {/* Fantasy Zen Bamboo Leaves */}
        <BambooLeaves count={30} />
        
        <CameraRig />
        
        <ZenStones />
        <ZenRipple />
        
        {/* Beautiful Soft Shadow (Baked on Frame 1 for Zero Runtime Lag) */}
        <ContactShadows 
          frames={1} 
          position={[0, -2.49, 0]} 
          scale={15} 
          blur={3} 
          opacity={0.65} 
          far={10} 
          resolution={512} 
          color="#16201a" 
        />
      </Canvas>
    </div>
  );
}
