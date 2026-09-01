import { useRef, useMemo, useEffect } from 'react';
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

const leafColors = ['#2c4217', '#466329', '#5a8232', '#709940', '#3b5420'];
const colorObj = new THREE.Color();

export default function BambooLeaves({ count = 50 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const leafGeometry = useMemo(() => createBambooLeafGeometry(), []);
  
  const leaves = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      // Exaggerated scale: heavily bias towards smaller background leaves, with a few massive foreground ones
      const isForeground = Math.random() > 0.85;
      const baseScale = isForeground ? Math.random() * 2.0 + 1.2 : Math.random() * 0.5 + 0.2;
      const randomColor = leafColors[Math.floor(Math.random() * leafColors.length)];

      return {
        x: (Math.random() - 0.5) * 25,
        y: Math.random() * 25 - 5,
        z: (Math.random() - 0.5) * 15 - 2,
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

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (meshRef.current) {
      leaves.forEach((leaf, i) => {
        colorObj.set(leaf.color);
        meshRef.current!.setColorAt(i, colorObj);
      });
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [leaves]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const timeScale = Math.min(delta * 60, 2);

    leaves.forEach((leaf, i) => {
      // falling down smoothly
      leaf.y -= leaf.speed * timeScale;
      
      // loop back to top
      if (leaf.y < -12) {
        leaf.y = 15;
        leaf.x = (Math.random() - 0.5) * 25;
      }

      // swaying
      const sway = Math.sin(time * leaf.swaySpeed + leaf.swayPhase) * 0.02 * timeScale;
      leaf.x += sway;
      leaf.z += sway * 0.3;

      // deflect
      const distToCenter = Math.sqrt(leaf.x * leaf.x + leaf.z * leaf.z);
      if (distToCenter < 2.8 && leaf.y < 2.5 && leaf.y > -2.5) {
        const pushForce = (2.8 - distToCenter) * 0.04 * timeScale;
        const dirX = leaf.x === 0 ? 1 : leaf.x / distToCenter;
        const dirZ = leaf.z === 0 ? 1 : leaf.z / distToCenter;
        leaf.x += dirX * pushForce;
        leaf.z += dirZ * pushForce;
      }

      // rotate
      leaf.rx += leaf.rs * timeScale;
      leaf.ry += leaf.rySpeed * timeScale;
      leaf.rz += leaf.rs * timeScale;

      dummy.position.set(leaf.x, leaf.y, leaf.z);
      dummy.rotation.set(leaf.rx, leaf.ry, leaf.rz);
      dummy.scale.setScalar(leaf.scale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[leafGeometry, undefined, count]} frustumCulled={false}>
      <meshLambertMaterial side={THREE.DoubleSide} />
    </instancedMesh>
  );
}
