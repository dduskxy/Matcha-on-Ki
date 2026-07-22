import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const createBambooLeafGeometry = () => {
  const shape = new THREE.Shape();
  // Tapered bamboo leaf silhouette
  shape.moveTo(0, -0.6);
  shape.quadraticCurveTo(0.12, -0.1, 0.08, 0.6);
  shape.quadraticCurveTo(0, 0.7, -0.08, 0.6);
  shape.quadraticCurveTo(-0.12, -0.1, 0, -0.6);

  const geometry = new THREE.ShapeGeometry(shape, 12);
  
  // Subtle 3D curve along central vein
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // Subtle lengthwise bending + longitudinal fold
    pos.setZ(i, -Math.pow(x, 2) * 2.5 + Math.sin((y + 0.6) * Math.PI) * 0.08);
  }
  geometry.computeVertexNormals();
  return geometry;
};

const SingleLeaf = ({ leaf, geometry }: { leaf: any, geometry: THREE.BufferGeometry }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const timeScale = Math.min(delta * 60, 2); // Cap delta to prevent massive jumps on tab switch

    // falling down smoothly
    leaf.y -= leaf.speed * timeScale;
    
    // loop back to top when they fall past the floor
    if (leaf.y < -12) {
      leaf.y = 15;
      leaf.x = (Math.random() - 0.5) * 25;
    }

    // swaying side to side gently in the wind
    const sway = Math.sin(time * leaf.swaySpeed + leaf.swayPhase) * 0.02 * timeScale;
    leaf.x += sway;
    leaf.z += sway * 0.3;

    // tumbling / rotating gently
    leaf.rx += leaf.rs * timeScale;
    leaf.ry += leaf.rySpeed * timeScale;
    leaf.rz += leaf.rs * timeScale;

    meshRef.current.position.set(leaf.x, leaf.y, leaf.z);
    meshRef.current.rotation.set(leaf.rx, leaf.ry, leaf.rz);
    meshRef.current.scale.setScalar(leaf.scale);
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial 
        color="#36592C"
        emissive="#6BB352"
        emissiveIntensity={0.25}
        roughness={0.35}
        metalness={0.15}
        transparent={true}
        opacity={0.82}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

export default function BambooLeaves({ count = 15 }) {
  const leafGeometry = useMemo(() => createBambooLeafGeometry(), []);
  
  const leaves = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 25,
      y: Math.random() * 25 - 5,
      z: (Math.random() - 0.5) * 15 - 5,
      scale: Math.random() * 0.6 + 0.3,
      speed: Math.random() * 0.02 + 0.008,
      swaySpeed: Math.random() * 0.8 + 0.4,
      swayPhase: Math.random() * Math.PI * 2,
      rx: Math.random() * Math.PI * 2,
      ry: Math.random() * Math.PI * 2,
      rz: Math.random() * Math.PI * 2,
      rs: (Math.random() - 0.5) * 0.015,
      rySpeed: (Math.random() - 0.5) * 0.025,
    }));
  }, [count]);

  return (
    <group>
      {leaves.map((leaf, idx) => (
        <SingleLeaf key={idx} leaf={leaf} geometry={leafGeometry} />
      ))}
    </group>
  );
}
