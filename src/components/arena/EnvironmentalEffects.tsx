'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EnvironmentalEffectsProps {
  theme: string;
  intensity: number;
}

function FloatingParticle({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const offset = useRef({
    x: (Math.random() - 0.5) * 20,
    z: (Math.random() - 0.5) * 20,
    speed: 0.3 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
  });

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    offset.current.phase += delta * offset.current.speed;
    meshRef.current.position.y = 0.5 + Math.sin(offset.current.phase) * 2;
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh ref={meshRef} position={[offset.current.x, 1, offset.current.z]}>
      <octahedronGeometry args={[0.05, 0]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

export default function EnvironmentalEffects({ theme, intensity }: EnvironmentalEffectsProps) {
  const particleColor = theme === 'cyberpunk' ? '#00aaff' : theme === 'medieval' ? '#ffaa00' : '#00ff88';
  const count = Math.floor(intensity * 20);

  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <FloatingParticle key={i} color={particleColor} />
      ))}
    </group>
  );
}
