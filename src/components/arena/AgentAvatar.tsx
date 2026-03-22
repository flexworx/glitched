'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface AgentAvatarProps {
  position: [number, number, number];
  color: string;
  name: string;
  hp: number;
  maxHp: number;
  isActive: boolean;
  isEliminated: boolean;
  onClick?: () => void;
}

export default function AgentAvatar({ position, color, name, hp, maxHp, isActive, isEliminated, onClick }: AgentAvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (!meshRef.current || isEliminated) return;

    // Idle bob
    meshRef.current.position.y = position[1] + Math.sin(t.current * 2) * 0.05;

    // Active pulse
    if (isActive && glowRef.current) {
      const scale = 1 + Math.sin(t.current * 8) * 0.1;
      glowRef.current.scale.setScalar(scale);
    }
  });

  const hpPercent = hp / maxHp;
  const hpColor = hpPercent > 0.6 ? '#00ff88' : hpPercent > 0.3 ? '#ffaa00' : '#ff4444';

  if (isEliminated) {
    return (
      <group position={position}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 8]} />
          <meshStandardMaterial color="#333" transparent opacity={0.5} />
        </mesh>
        <Billboard position={[0, 0.5, 0]}>
          <Text fontSize={0.2} color="#666" anchorX="center" anchorY="middle">
            {name} ✕
          </Text>
        </Billboard>
      </group>
    );
  }

  return (
    <group position={position} onClick={onClick}>
      {/* Glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color={color} transparent opacity={isActive ? 0.15 : 0.05} />
      </mesh>

      {/* Main body */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.6, 0.8, 0.6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.5 : 0.2}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Point light */}
      <pointLight color={color} intensity={isActive ? 1.5 : 0.5} distance={3} />

      {/* Name label */}
      <Billboard position={[0, 0.9, 0]}>
        <Text fontSize={0.18} color={color} anchorX="center" anchorY="middle" font="/fonts/SpaceGrotesk-Bold.ttf">
          {name}
        </Text>
      </Billboard>

      {/* HP bar */}
      <Billboard position={[0, 0.65, 0]}>
        <mesh position={[-0.3, 0, 0]}>
          <planeGeometry args={[0.6, 0.06]} />
          <meshBasicMaterial color="#333" />
        </mesh>
        <mesh position={[-0.3 + (hpPercent * 0.6) / 2 - 0.3, 0, 0.001]}>
          <planeGeometry args={[hpPercent * 0.6, 0.06]} />
          <meshBasicMaterial color={hpColor} />
        </mesh>
      </Billboard>
    </group>
  );
}
