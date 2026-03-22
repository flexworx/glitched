'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MatchGridProps {
  size: number;
  theme: string;
  hazardTiles?: Array<[number, number]>;
  resourceTiles?: Array<[number, number]>;
  fortressTiles?: Array<[number, number]>;
}

const THEME_COLORS = {
  cyberpunk: { floor: '#050510', grid: '#001133', hazard: '#ff0044', resource: '#00ff88', fortress: '#0044ff' },
  medieval: { floor: '#0a0800', grid: '#221100', hazard: '#ff4400', resource: '#ffcc00', fortress: '#888888' },
  nature: { floor: '#050a00', grid: '#0a1500', hazard: '#ff4400', resource: '#00ff44', fortress: '#664400' },
  political: { floor: '#080008', grid: '#110011', hazard: '#ff0088', resource: '#ffcc00', fortress: '#8800ff' },
  default: { floor: '#050510', grid: '#001133', hazard: '#ff4444', resource: '#00ff88', fortress: '#0088ff' },
};

export default function MatchGrid({ size, theme, hazardTiles = [], resourceTiles = [], fortressTiles = [] }: MatchGridProps) {
  const colors = THEME_COLORS[theme as keyof typeof THEME_COLORS] || THEME_COLORS.default;
  const hazardSet = new Set(hazardTiles.map(([x, z]) => `${x},${z}`));
  const resourceSet = new Set(resourceTiles.map(([x, z]) => `${x},${z}`));
  const fortressSet = new Set(fortressTiles.map(([x, z]) => `${x},${z}`));

  return (
    <group>
      {/* Base floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color={colors.floor} metalness={0.3} roughness={0.8} />
      </mesh>

      {/* Grid lines */}
      <gridHelper args={[size, size, colors.grid, colors.grid]} position={[0, 0, 0]} />

      {/* Special tiles */}
      {Array.from({ length: size }, (_, x) =>
        Array.from({ length: size }, (_, z) => {
          const key = `${x},${z}`;
          const worldX = x - size / 2 + 0.5;
          const worldZ = z - size / 2 + 0.5;

          let tileColor = null;
          if (hazardSet.has(key)) tileColor = colors.hazard;
          else if (resourceSet.has(key)) tileColor = colors.resource;
          else if (fortressSet.has(key)) tileColor = colors.fortress;

          if (!tileColor) return null;

          return (
            <mesh key={key} position={[worldX, 0.01, worldZ]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.9, 0.9]} />
              <meshBasicMaterial color={tileColor} transparent opacity={0.3} />
            </mesh>
          );
        })
      )}
    </group>
  );
}
