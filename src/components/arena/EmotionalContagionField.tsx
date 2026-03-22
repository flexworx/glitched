'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EmotionSource {
  position: [number, number, number];
  emotion: string;
  intensity: number;
  agentId: string;
}

interface EmotionalContagionFieldProps {
  sources: EmotionSource[];
}

const EMOTION_COLORS: Record<string, string> = {
  fear: '#8800ff',
  anger: '#ff2200',
  hope: '#00ff88',
  despair: '#334455',
  confidence: '#ffcc00',
  paranoia: '#ff00aa',
  neutral: '#334455',
};

function EmotionRing({ position, emotion, intensity }: EmotionSource) {
  const meshRef = useRef<THREE.Mesh>(null);
  const t = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    t.current += delta;
    if (!meshRef.current) return;
    const scale = 1 + Math.sin(t.current * 1.5) * 0.2 * intensity;
    meshRef.current.scale.setScalar(scale);
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = intensity * 0.15 + Math.sin(t.current * 2) * 0.05;
  });

  const color = EMOTION_COLORS[emotion] || '#334455';

  return (
    <mesh ref={meshRef} position={[position[0], 0.05, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.8 * intensity, 1.2 * intensity, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function EmotionalContagionField({ sources }: EmotionalContagionFieldProps) {
  return (
    <group>
      {sources.map((source, i) => (
        <EmotionRing key={i} {...source} />
      ))}
    </group>
  );
}
