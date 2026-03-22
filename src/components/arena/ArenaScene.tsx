'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';

interface ArenaSceneProps {
  agents: Array<{ id: string; name: string; color: string; hp: number; maxHp: number; status: string; position: [number, number] }>;
  gridSize?: number;
}

export function ArenaScene({ agents, gridSize = 10 }: ArenaSceneProps) {
  const gridRef = useRef<Group>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  const gridOffset = (gridSize - 1) / 2;

  return (
    <group ref={gridRef}>
      {/* Arena floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[gridSize * 2 + 2, gridSize * 2 + 2]} />
        <meshStandardMaterial color="#0a0a14" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Grid lines */}
      {Array.from({ length: gridSize + 1 }, (_, i) => (
        <group key={`grid-${i}`}>
          <mesh position={[i * 2 - gridOffset * 2, 0, 0]}>
            <boxGeometry args={[0.02, 0.01, gridSize * 2]} />
            <meshStandardMaterial color="#00ff88" opacity={0.1} transparent />
          </mesh>
          <mesh position={[0, 0, i * 2 - gridOffset * 2]}>
            <boxGeometry args={[gridSize * 2, 0.01, 0.02]} />
            <meshStandardMaterial color="#00ff88" opacity={0.1} transparent />
          </mesh>
        </group>
      ))}

      {/* Agent tokens */}
      {agents.filter(a => a.status === 'alive').map(agent => (
        <AgentMesh key={agent.id} agent={agent} gridOffset={gridOffset} />
      ))}
    </group>
  );
}

function AgentMesh({ agent, gridOffset }: { agent: ArenaSceneProps['agents'][0]; gridOffset: number }) {
  const meshRef = useRef<Mesh>(null);
  const hpPct = agent.hp / agent.maxHp;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2 + agent.position[0]) * 0.1;
    }
  });

  return (
    <group position={[(agent.position[0] - gridOffset) * 2, 0, (agent.position[1] - gridOffset) * 2]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={0.3} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* HP ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.5, 0.6, 32, 1, 0, hpPct * Math.PI * 2]} />
        <meshStandardMaterial color={hpPct > 0.6 ? '#00ff88' : hpPct > 0.3 ? '#ffcc00' : '#ff4444'} />
      </mesh>
    </group>
  );
}

export default ArenaScene;
