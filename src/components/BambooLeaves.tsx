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

    // Deflect away from the central Zen Stones (radius ~2.8) to prevent unrealistic clipping
    const distToCenter = Math.sqrt(leaf.x * leaf.x + leaf.z * leaf.z);
    if (distToCenter < 2.8 && leaf.y < 2.5 && leaf.y > -2.5) {
      const pushForce = (2.8 - distToCenter) * 0.04 * timeScale;
      // push outwards from center
      const dirX = leaf.x === 0 ? 1 : leaf.x / distToCenter;
      const dirZ = leaf.z === 0 ? 1 : leaf.z / distToCenter;
      leaf.x += dirX * pushForce;
      leaf.z += dirZ * pushForce;
    }

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
        color={leaf.color}
        roughness={0.7}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default function BambooLeaves({ count = 25 }) {
  const leafGeometry = useMemo(() => createBambooLeafGeometry(), []);
  
  const leafColors = ['#2c4217', '#466329', '#5a8232', '#709940', '#3b5420'];

  const leaves = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      // Exaggerated scale: heavily bias towards smaller background leaves, with a few massive foreground ones
      const isForeground = Math.random() > 0.85;
      const baseScale = isForeground ? Math.random() * 2.0 + 1.2 : Math.random() * 0.5 + 0.2;
      const randomColor = leafColors[Math.floor(Math.random() * leafColors.length)];

      return {
        x: (Math.random() - 0.5) * 25,
        y: Math.random() * 25 - 5,
        z: (Math.random() - 0.5) * 15 - 2, // Push slightly back so they don't block the UI
        scale: baseScale,
        color: randomColor,
        speed: Math.random() * 0.015 + 0.005,
        swaySpeed: Math.random() * 0.5 + 0.2,
        swayPhase: Math.random() * Math.PI * 2,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        rs: (Math.random() - 0.5) * 0.015,
        rySpeed: (Math.random() - 0.5) * 0.02,
      };
    });
  }, [count]);

  return (
    <group>
      {leaves.map((leaf, idx) => (
        <SingleLeaf key={idx} leaf={leaf} geometry={leafGeometry} />
      ))}
    </group>
  );
}
