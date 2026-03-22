'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AgentModelProps {
  color: string;
  archetype: string;
  isActive: boolean;
  action?: string;
}

export default function AgentModel({ color, archetype, isActive, action }: AgentModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (!groupRef.current) return;

    if (action === 'attack') {
      groupRef.current.rotation.y = Math.sin(t.current * 15) * 0.3;
    } else if (isActive) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  const getGeometry = () => {
    switch (archetype?.toLowerCase()) {
      case 'sovereign': return <octahedronGeometry args={[0.4, 0]} />;
      case 'enforcer': return <boxGeometry args={[0.5, 0.7, 0.5]} />;
      case 'mystic': return <tetrahedronGeometry args={[0.45, 0]} />;
      case 'oracle': return <sphereGeometry args={[0.35, 8, 8]} />;
      default: return <boxGeometry args={[0.4, 0.6, 0.4]} />;
    }
  };

  return (
    <group ref={groupRef}>
      <mesh>
        {getGeometry()}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.6 : 0.2}
          metalness={0.7}
          roughness={0.2}
          wireframe={archetype === 'oracle'}
        />
      </mesh>
    </group>
  );
}
