import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

import { OrbitControls, Sparkles, ContactShadows } from '@react-three/drei';
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
      {/* Bottom Stone (Polished Obsidian) */}
      <mesh position={[0, -0.8, 0]} rotation={[0.05, 0.2, -0.05]} scale={[1.7, 0.5, 1.6]} castShadow receiveShadow>
        <sphereGeometry args={[1, 48, 48]} />
        <meshPhysicalMaterial 
          color="#16181a" 
          roughness={0.25} 
          metalness={0.2}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Middle Stone (Matcha Jade) */}
      <mesh position={[0.05, -0.1, 0.05]} rotation={[-0.1, -0.4, 0.05]} scale={[1.4, 0.4, 1.3]} castShadow receiveShadow>
        <sphereGeometry args={[1, 48, 48]} />
        <meshPhysicalMaterial 
          color="#527048" 
          roughness={0.15} 
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.15}
          transmission={0.4}
          thickness={0.5}
        />
      </mesh>

      {/* Top Stone (Frosted Quartz / Pearl) */}
      <mesh position={[-0.05, 0.4, -0.05]} rotation={[0.1, 0.5, -0.1]} scale={[0.8, 0.3, 0.7]} castShadow receiveShadow>
        <sphereGeometry args={[1, 48, 48]} />
        <meshPhysicalMaterial 
          color="#fdfdfd"
          roughness={0.1}
          metalness={0.05}
          transmission={0.8}
          ior={1.4}
          thickness={1.2}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
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
        dpr={[1, 1.5]} 
        performance={{ min: 0.5 }}
        gl={{ antialias: true, stencil: false, depth: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}
        shadows
      >
        <fog attach="fog" args={['#ffffff', 5, 20]} />
        
        {/* Cinematic 3-Point Lighting */}
        
        {/* Ambient Fill (Soft Base Light) */}
        <ambientLight intensity={0.4} color="#e8f0e6" />
        
        {/* Key Light (Sun) - Casts crisp, soft-edged shadows */}
        <directionalLight
          position={[6, 12, -4]}
          intensity={3}
          color="#fff5e6"
          castShadow
          shadow-mapSize={[512, 512]}
          shadow-bias={-0.0001}
        />
        
        {/* Fill Light (Sky reflection) - Cool tone to contrast the warm sun */}
        <directionalLight
          position={[-6, 6, 6]}
          intensity={1.2}
          color="#dbeafe"
        />

        {/* Rim Light (Backlight) - Highlights the edges of the stones, making them pop in 3D */}
        <pointLight
          position={[0, -2, -6]}
          intensity={2}
          color="#a8d5ba"
        />
        
        {/* Morning Mist Particles */}
        <Sparkles count={50} scale={20} size={3} speed={0.4} opacity={0.6} color="#85b865" />

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
        
        {/* Cinematic Contact Shadows (Baked ONCE for zero lag) */}
        <ContactShadows 
          frames={1} 
          position={[0, -2.49, 0]} 
          scale={15} 
          blur={2.5} 
          opacity={0.65} 
          far={10} 
          resolution={512} 
          color="#16201a" 
        />
      </Canvas>
    </div>
  );
}
