'use client';
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ButterflyEffectShockwaveProps {
  position: [number, number, number];
  color: string;
  intensity: number;
  onComplete?: () => void;
}

export default function ButterflyEffectShockwave({ position, color, intensity, onComplete }: ButterflyEffectShockwaveProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  useFrame((_, delta) => {
    progress.current += delta * 0.8;
    if (!meshRef.current) return;

    const scale = progress.current * intensity * 8;
    meshRef.current.scale.setScalar(scale);

    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0, 1 - progress.current);

    if (progress.current >= 1) {
      onComplete?.();
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.8, 1, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
    </mesh>
  );
}
