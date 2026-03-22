'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FogOfWarProps {
  gridSize: number;
  visibleTiles: Array<[number, number]>;
  spectatorMode: boolean;
}

export default function FogOfWar({ gridSize, visibleTiles, spectatorMode }: FogOfWarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
  });

  if (spectatorMode) return null; // Spectators see everything

  const visibleSet = new Set(visibleTiles.map(([x, z]) => `${x},${z}`));

  return (
    <group ref={groupRef}>
      {Array.from({ length: gridSize }, (_, x) =>
        Array.from({ length: gridSize }, (_, z) => {
          if (visibleSet.has(`${x},${z}`)) return null;
          return (
            <mesh key={`${x},${z}`} position={[x - gridSize / 2 + 0.5, 0.1, z - gridSize / 2 + 0.5]}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial color="#000" transparent opacity={0.7} side={THREE.DoubleSide} />
            </mesh>
          );
        })
      )}
    </group>
  );
}
