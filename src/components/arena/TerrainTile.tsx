'use client';
import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';

interface TerrainTileProps {
  position: [number, number, number];
  type: 'normal' | 'hazard' | 'resource' | 'fortress' | 'void';
  elevation?: number;
}

const TILE_COLORS: Record<string, string> = {
  normal: '#1a1a2e',
  hazard: '#ff0040',
  resource: '#00ff88',
  fortress: '#8b5cf6',
  void: '#000000',
};

export function TerrainTile({ position, type, elevation = 0 }: TerrainTileProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && type === 'resource') {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const color = TILE_COLORS[type];
  const height = 0.1 + elevation * 0.5;

  return (
    <mesh ref={meshRef} position={[position[0], position[1] + height / 2, position[2]]}>
      <boxGeometry args={[1.9, height, 1.9]} />
      <meshStandardMaterial
        color={color}
        emissive={type !== 'normal' ? color : '#000000'}
        emissiveIntensity={type !== 'normal' ? 0.2 : 0}
        opacity={type === 'void' ? 0.1 : 1}
        transparent={type === 'void'}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
}
export default TerrainTile;
