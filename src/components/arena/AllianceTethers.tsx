'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Alliance {
  agentA: string;
  agentB: string;
  strength: number;
  status: string;
}

interface AgentPosition {
  id: string;
  position: [number, number, number];
}

interface AllianceTethersProps {
  alliances: Alliance[];
  agentPositions: AgentPosition[];
}

function TetherLine({ start, end, strength, status }: { start: THREE.Vector3; end: THREE.Vector3; strength: number; status: string }) {
  const lineRef = useRef<THREE.Line>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (!lineRef.current) return;
    const mat = lineRef.current.material as THREE.LineBasicMaterial;
    if (status === 'active') {
      mat.opacity = 0.3 + Math.sin(t.current * 2) * 0.1;
    }
  });

  const points = [start, end];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const color = status === 'betrayed' ? '#ff4444' : status === 'broken' ? '#666' : '#00ff88';

  return (
    <line ref={lineRef as React.RefObject<THREE.Line>} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.4} linewidth={strength * 3} />
    </line>
  );
}

export default function AllianceTethers({ alliances, agentPositions }: AllianceTethersProps) {
  const posMap = new Map(agentPositions.map(a => [a.id, new THREE.Vector3(...a.position)]));

  return (
    <group>
      {alliances.map((alliance, i) => {
        const posA = posMap.get(alliance.agentA);
        const posB = posMap.get(alliance.agentB);
        if (!posA || !posB) return null;

        return (
          <TetherLine
            key={i}
            start={posA}
            end={posB}
            strength={alliance.strength}
            status={alliance.status}
          />
        );
      })}
    </group>
  );
}
