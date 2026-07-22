import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function MatchaBowl() {
  const matchaRef = useRef<THREE.Mesh>(null);
  const bubblesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (matchaRef.current) {
      matchaRef.current.rotation.y = t * 0.05;
    }
    if (bubblesRef.current) {
      bubblesRef.current.rotation.y = -t * 0.02;
    }
  });

  return (
    <group position={[0, -0.4, 0]} scale={1.3}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.1}>
        <group>
          {/* Outer Ceramic Bowl */}
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <cylinderGeometry args={[1.5, 0.8, 1.2, 64, 1, false]} />
            <meshPhysicalMaterial 
              color="#161816"
              roughness={0.6}
              metalness={0.1}
              clearcoat={0.3}
              clearcoatRoughness={0.4}
            />
          </mesh>

          {/* Inner Ceramic Surface */}
          <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
            <cylinderGeometry args={[1.45, 0.75, 1.18, 64, 1, true]} />
            <meshPhysicalMaterial 
              color="#0d0e0d"
              roughness={0.3}
              metalness={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Matcha Liquid (Frothy Green) */}
          <mesh ref={matchaRef} position={[0, 0.3, 0]} receiveShadow>
            <cylinderGeometry args={[1.38, 1.1, 0.6, 64]} />
            <meshPhysicalMaterial 
              color="#688F46"
              emissive="#2A3D19"
              emissiveIntensity={0.2}
              roughness={0.2}
              transmission={0.5}
              thickness={1.5}
              clearcoat={1.0}
              clearcoatRoughness={0.1}
            />
          </mesh>

          {/* Matcha Bubbles / Froth */}
          <group ref={bubblesRef} position={[0, 0.61, 0]}>
            {Array.from({ length: 40 }).map((_, i) => {
              const r = Math.sqrt(Math.random()) * 1.3;
              const theta = Math.random() * Math.PI * 2;
              return (
                <mesh key={i} position={[r * Math.cos(theta), 0, r * Math.sin(theta)]} scale={Math.random() * 0.08 + 0.03}>
                  <sphereGeometry args={[1, 16, 16]} />
                  <meshPhysicalMaterial color="#9CC474" roughness={0.6} clearcoat={1.0} clearcoatRoughness={0.2} />
                </mesh>
              )
            })}
          </group>

          {/* Glass Chasen / Whisk (abstract luxury representation) */}
          <mesh position={[0.6, 0.5, -0.6]} rotation={[0.5, 0, -0.4]} castShadow>
            <cylinderGeometry args={[0.08, 0.15, 1.4, 32]} />
            <MeshTransmissionMaterial 
              thickness={1.0}
              anisotropy={0.2}
              ior={1.5}
              color="#ffffff"
              transmission={1}
              roughness={0.05}
              distortion={0.3}
              distortionScale={0.2}
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}
