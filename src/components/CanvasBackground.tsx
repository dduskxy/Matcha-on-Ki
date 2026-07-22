import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import BambooLeaves from './BambooLeaves';
import MatchaBowl from './MatchaBowl';

const ZenStones = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02; // Very slow hypnotic rotation
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.0, 0]} scale={1.5}>
      {/* Base Polished Stone */}
      <mesh position={[0, -0.2, 0]} rotation={[-0.1, 0, 0.1]} scale={[2.5, 0.4, 2.5]} receiveShadow>
        <sphereGeometry args={[1, 64, 32]} />
        <meshPhysicalMaterial 
          color="#121212" 
          roughness={0.1} 
          metalness={0.2} 
          clearcoat={1.0} 
          clearcoatRoughness={0.1} 
          ior={1.6} 
        />
      </mesh>
    </group>
  );
};

export default function CanvasBackground() {
  return (
    <div className="fixed inset-0 z-[-10]">
      <Canvas 
        camera={{ position: [0, 2, 8], fov: 40 }} 
        dpr={[1, 2]} 
        performance={{ min: 0.5 }}
        gl={{ antialias: true, stencil: false, depth: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}
        shadows
      >
        <color attach="background" args={['#dce5df']} />

        <Environment preset="city" background={false} environmentIntensity={0.6} />
        
        <ambientLight intensity={0.5} color="#ffffff" />
        <spotLight
          position={[5, 10, 5]}
          intensity={2.5}
          color="#f5ffe6"
          angle={0.5}
          penumbra={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <spotLight
          position={[-5, 5, -5]}
          intensity={1}
          color="#e6f2ff"
          angle={0.5}
          penumbra={1}
        />
        
        <Sparkles count={40} scale={12} size={1.5} speed={0.1} opacity={0.4} color="#ffffff" />

        <BambooLeaves count={8} />

        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2 - 0.4}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minAzimuthAngle={-0.3}
          maxAzimuthAngle={0.3}
          enableDamping={true}
          dampingFactor={0.03}
          autoRotate={true}
          autoRotateSpeed={0.3}
        />
        
        <ZenStones />
        <MatchaBowl />
        
        <ContactShadows 
          frames={1} 
          position={[0, -1.6, 0]} 
          scale={15} 
          blur={2.5} 
          opacity={0.8} 
          far={10} 
          resolution={1024} 
          color="#0a120c" 
        />
      </Canvas>
    </div>
  );
}
