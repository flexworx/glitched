'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AgentAnimationsProps {
  meshRef: React.RefObject<THREE.Mesh>;
  action: string;
  isActive: boolean;
  color: string;
}

export function useAgentAnimation(action: string, isActive: boolean) {
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
  });

  const getAnimationOffset = () => {
    switch (action) {
      case 'attack': return Math.sin(t.current * 10) * 0.1;
      case 'defend': return 0;
      case 'betray': return Math.sin(t.current * 5) * 0.05;
      case 'negotiate': return Math.sin(t.current * 2) * 0.03;
      default: return isActive ? Math.sin(t.current * 3) * 0.02 : 0;
    }
  };

  return { yOffset: getAnimationOffset(), time: t.current };
}

export function AgentAnimationController({ meshRef, action, isActive, color }: AgentAnimationsProps) {
  const { yOffset } = useAgentAnimation(action, isActive);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.y = 0.5 + yOffset;
    if (action === 'attack') {
      meshRef.current.rotation.y += 0.05;
    }
  });

  return null;
}
