'use client';
import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { GameState, AgentGameState, Position } from '@/lib/types/game-state';
import { calculateDramaScore } from '@/lib/engine/drama-score';
import { getVERITASColor } from '@/lib/engine/veritas-calculator';
import type { VERITASTier } from '@/lib/types/agent';

// ============================================================
// CAMERA MODES
// ============================================================
export type CameraMode = 'overview' | 'trackside' | 'dramatic' | 'pip' | 'redzoneA' | 'redzoneB';

interface CameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const CAMERA_CONFIGS: Record<CameraMode, CameraConfig> = {
  overview:  { position: [0, 35, 0],   target: [0, 0, 0],  fov: 65 },
  trackside: { position: [22, 12, 22], target: [0, 0, 0],  fov: 50 },
  dramatic:  { position: [8, 4, 12],   target: [0, 1, 0],  fov: 40 },
  pip:       { position: [5, 8, 5],    target: [0, 0, 0],  fov: 45 },
  redzoneA:  { position: [-20, 10, 20],target: [0, 0, 0],  fov: 50 },
  redzoneB:  { position: [20, 10, -20],target: [0, 0, 0],  fov: 50 },
};

const TERRAIN_COLORS: Record<string, string> = {
  plains:   '#1a2a1a',
  mountains:'#3a3a4a',
  water:    '#0a1a3a',
  forest:   '#0a2a0a',
  lava:     '#3a0a00',
  crystal:  '#1a0a3a',
  ruins:    '#2a2a1a',
  void:     '#050508',
};

// ============================================================
// PURE THREE.JS: BILLBOARD (always faces camera, no drei)
// ============================================================
function BillboardGroup({
  position,
  children,
}: {
  position: [number, number, number];
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.quaternion.copy(camera.quaternion);
    }
  });
  return (
    <group ref={groupRef} position={position}>
      {children}
    </group>
  );
}

// ============================================================
// PURE THREE.JS: TEXT (canvas texture on plane, no drei)
// ============================================================
function TextLabel({
  text,
  fontSize = 0.2,
  color = '#ffffff',
}: {
  text: string;
  fontSize?: number;
  color?: string;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const px = 32;
    canvas.width = Math.max(text.length * px * 0.65, 64);
    canvas.height = px * 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `bold ${px}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = color;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [text, color]);

  const aspect = texture.image ? (texture.image as HTMLCanvasElement).width / (texture.image as HTMLCanvasElement).height : 4;
  const w = fontSize * aspect * 2;
  const h = fontSize * 2;

  return (
    <mesh>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ============================================================
// PURE THREE.JS: STAR FIELD (particle system, no drei)
// ============================================================
function StarField({ count = 3000, radius = 100, depth = 50 }: {
  count?: number; radius?: number; depth?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = radius + (Math.random() - 0.5) * depth;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const b = 0.7 + Math.random() * 0.3;
      col[i * 3] = b; col[i * 3 + 1] = b; col[i * 3 + 2] = b;
    }
    return { positions: pos, colors: col };
  }, [count, radius, depth]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.3} vertexColors transparent opacity={0.8} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ============================================================
// ARENA TILE
// ============================================================
function ArenaTile({
  x, y, terrain, isVisible, hasResource, hasHazard, isHighlighted,
}: {
  x: number; y: number; terrain: string; isVisible: boolean;
  hasResource?: boolean; hasHazard?: boolean; isHighlighted?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = TERRAIN_COLORS[terrain] || TERRAIN_COLORS.plains;

  useFrame((state) => {
    if (meshRef.current && isHighlighted) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  return (
    <group position={[x - 10, 0, y - 10]}>
      <mesh ref={meshRef} receiveShadow>
        <boxGeometry args={[0.95, 0.1, 0.95]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isVisible ? 1 : 0.3}
          emissive={isHighlighted ? '#39FF14' : color}
          emissiveIntensity={isHighlighted ? 0.3 : 0.05}
        />
      </mesh>
      {hasResource && isVisible && (
        <mesh position={[0, 0.15, 0]}>
          <octahedronGeometry args={[0.12]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.8} />
        </mesh>
      )}
      {hasHazard && isVisible && (
        <mesh position={[0, 0.15, 0]}>
          <tetrahedronGeometry args={[0.15]} />
          <meshStandardMaterial color="#FF006E" emissive="#FF006E" emissiveIntensity={1.0} />
        </mesh>
      )}
    </group>
  );
}

// ============================================================
// AGENT TOKEN
// ============================================================
function AgentToken({
  position, hp, maxHp, isEliminated, isGhost, signatureColor, name, isSelected,
}: {
  agentId: string; position: Position; hp: number; maxHp: number;
  isEliminated: boolean; isGhost: boolean; signatureColor: string;
  name: string; isSelected: boolean;
}) {
  const groupRef  = useRef<THREE.Group>(null);
  const glowRef   = useRef<THREE.Mesh>(null);
  const ringRef   = useRef<THREE.Mesh>(null);
  const hpRatio   = maxHp > 0 ? hp / maxHp : 0;
  const color     = isGhost ? '#7B2FBE' : signatureColor;
  const height    = isGhost ? 1.5 : 0.8;

  useFrame((state) => {
    if (!groupRef.current) return;
    if (isGhost) {
      groupRef.current.position.y = height / 2 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
      groupRef.current.rotation.y += 0.01;
    } else if (isSelected) {
      groupRef.current.rotation.y += 0.02;
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
    if (ringRef.current && isSelected) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 2;
    }
  });

  if (isEliminated && !isGhost) return null;

  return (
    <group ref={groupRef} position={[position.x - 10, height / 2, position.y - 10]}>
      {/* Agent body */}
      <mesh ref={glowRef} castShadow>
        <cylinderGeometry args={[0.3, 0.35, height, 8]} />
        <meshStandardMaterial
          color={color} emissive={color} emissiveIntensity={0.4}
          transparent={isGhost} opacity={isGhost ? 0.6 : 1.0}
        />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, height / 2 + 0.1, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      {/* HP bar background */}
      <mesh position={[0, height + 0.3, 0]}>
        <boxGeometry args={[0.6, 0.08, 0.08]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
      {/* HP bar fill */}
      <mesh position={[-(0.6 * (1 - hpRatio)) / 2, height + 0.3, 0]}>
        <boxGeometry args={[0.6 * hpRatio, 0.08, 0.09]} />
        <meshBasicMaterial color={hpRatio > 0.5 ? '#39FF14' : hpRatio > 0.25 ? '#FFD60A' : '#FF006E'} />
      </mesh>
      {/* Selection ring */}
      {isSelected && (
        <mesh ref={ringRef} position={[0, -height / 2 + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 16]} />
          <meshBasicMaterial color="#39FF14" transparent opacity={0.8} />
        </mesh>
      )}
      {/* Name label — pure Three.js Billboard + TextLabel */}
      <BillboardGroup position={[0, height + 0.6, 0]}>
        <TextLabel text={name} fontSize={0.2} color={color} />
      </BillboardGroup>
      {/* Ghost indicator */}
      {isGhost && (
        <BillboardGroup position={[0, height + 1.0, 0]}>
          <TextLabel text="[GHOST]" fontSize={0.15} color="#7B2FBE" />
        </BillboardGroup>
      )}
    </group>
  );
}

// ============================================================
// ARENA GRID
// ============================================================
function ArenaGrid({ gameState }: { gameState: GameState }) {
  const { board } = gameState;
  if (!board || !board.tiles) return null;
  return (
    <group>
      {board.tiles.map((row, y) =>
        row.map((tile, x) => (
          <ArenaTile
            key={`${x}-${y}`}
            x={x} y={y}
            terrain={tile.terrain || 'plains'}
            isVisible={tile.isVisible !== false}
            hasResource={tile.hasResource}
            hasHazard={tile.hasHazard}
          />
        ))
      )}
    </group>
  );
}

// ============================================================
// AMBIENT EFFECTS
// ============================================================
function ArenaEffects({ dramaScore }: { dramaScore: number }) {
  const { scene } = useThree();
  const dramaLightRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    const fog = new THREE.FogExp2('#0a0a0f', 0.02 + dramaScore * 0.0003);
    scene.fog = fog;
    return () => { scene.fog = null; };
  }, [dramaScore, scene]);

  useFrame((state) => {
    if (dramaLightRef.current) {
      dramaLightRef.current.intensity =
        (dramaScore / 50) + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} color="#1a1a2e" />
      <directionalLight position={[10, 20, 10]} intensity={0.8} color="#ffffff" castShadow />
      <pointLight position={[0, 5, 0]}     intensity={1.5} color="#39FF14" distance={20} />
      <pointLight position={[-10, 3, -10]} intensity={0.8} color="#00D4FF" distance={15} />
      <pointLight position={[10, 3, 10]}   intensity={0.8} color="#7B2FBE" distance={15} />
      <pointLight ref={dramaLightRef} position={[0, 10, 0]} intensity={dramaScore / 50} color="#FF006E" distance={30} />
      {/* Pure Three.js star field — ZERO drei */}
      <StarField count={3000} radius={100} depth={50} />
    </>
  );
}

// ============================================================
// CAMERA CONTROLLER
// ============================================================
function CameraController({ mode, focusPosition, autoOrbit }: {
  mode: CameraMode; focusPosition?: Position; autoOrbit: boolean;
}) {
  const { camera } = useThree();
  const config = CAMERA_CONFIGS[mode];
  const targetRef   = useRef(new THREE.Vector3(...config.target));
  const positionRef = useRef(new THREE.Vector3(...config.position));

  useEffect(() => {
    if (focusPosition && mode === 'dramatic') {
      positionRef.current.set(focusPosition.x - 10 + 5, 4, focusPosition.y - 10 + 8);
      targetRef.current.set(focusPosition.x - 10, 1, focusPosition.y - 10);
    } else {
      positionRef.current.set(...config.position);
      targetRef.current.set(...config.target);
    }
  }, [mode, focusPosition, config]);

  useFrame((state) => {
    if (autoOrbit && mode === 'overview') {
      const t = state.clock.elapsedTime * 0.05;
      camera.position.x = Math.sin(t) * 35;
      camera.position.z = Math.cos(t) * 35;
      camera.position.y = 30;
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.lerp(positionRef.current, 0.05);
      camera.lookAt(targetRef.current);
    }
  });

  return null;
}

// ============================================================
// DRAMA INDICATOR
// ============================================================
function DramaIndicator({ score }: { score: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = score > 70 ? '#FF006E' : score > 40 ? '#FFD60A' : '#39FF14';

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + (score / 100) * 0.7 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
    }
  });

  return (
    <group position={[12, 0.5, -12]}>
      <mesh ref={meshRef}>
        <torusGeometry args={[0.8, 0.15, 8, 32, (score / 100) * Math.PI * 2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      {/* Pure Three.js Billboard + TextLabel */}
      <BillboardGroup position={[0, 1.5, 0]}>
        <TextLabel text={`DRAMA ${Math.round(score)}`} fontSize={0.25} color={color} />
      </BillboardGroup>
    </group>
  );
}

// ============================================================
// COMBAT PARTICLES
// ============================================================
function CombatParticles({ position, active }: {
  position: [number, number, number]; active: boolean;
}) {
  const pointsRef   = useRef<THREE.Points>(null);
  const velocities  = useRef<Float32Array>(new Float32Array(90));

  const positions = useMemo(() => {
    const count = 30;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
      vel[i * 3]     = (Math.random() - 0.5) * 0.1;
      vel[i * 3 + 1] = Math.random() * 0.15;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    velocities.current = vel;
    return pos;
  }, []);

  useFrame(() => {
    if (!pointsRef.current || !active) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3]     += velocities.current[i * 3];
      pos[i * 3 + 1] += velocities.current[i * 3 + 1];
      pos[i * 3 + 2] += velocities.current[i * 3 + 2];
      velocities.current[i * 3 + 1] -= 0.003;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#FF006E" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

// ============================================================
// MAIN ARENA 3D COMPONENT
// ============================================================
interface Arena3DProps {
  gameState: GameState;
  agentProfiles: Record<string, { name: string; signatureColor: string; veritasTier: VERITASTier }>;
  cameraMode?: CameraMode;
  onCameraModeChange?: (mode: CameraMode) => void;
  selectedAgentId?: string;
  onAgentSelect?: (agentId: string) => void;
  autoOrbit?: boolean;
  showPIP?: boolean;
  pipMatchState?: GameState;
  pipAgentProfiles?: Record<string, { name: string; signatureColor: string; veritasTier: VERITASTier }>;
  className?: string;
}

export default function Arena3D({
  gameState,
  agentProfiles,
  cameraMode = 'overview',
  onCameraModeChange,
  selectedAgentId,
  onAgentSelect,
  autoOrbit = false,
  showPIP = false,
  pipMatchState,
  pipAgentProfiles,
  className = '',
}: Arena3DProps) {
  const dramaScore = calculateDramaScore(gameState);
  const [focusPosition, setFocusPosition] = useState<Position | undefined>();

  useEffect(() => {
    if (cameraMode === 'dramatic' && gameState.lastDramaticEvent) {
      setFocusPosition(gameState.lastDramaticEvent.position);
    }
  }, [cameraMode, gameState.lastDramaticEvent]);

  return (
    <div className={`relative w-full h-full bg-[#0a0a0f] ${className}`}>
      {/* Main 3D Canvas */}
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ background: '#0a0a0f' }}
        camera={{ position: [0, 35, 0], fov: 65, near: 0.1, far: 500 }}
      >
        <Suspense fallback={null}>
          <CameraController mode={cameraMode} focusPosition={focusPosition} autoOrbit={autoOrbit} />
          <ArenaEffects dramaScore={dramaScore} />
          <ArenaGrid gameState={gameState} />

          {/* Agent tokens */}
          {Object.entries(gameState.agents).map(([agentId, agentState]) => {
            const profile = agentProfiles[agentId];
            if (!profile) return null;
            return (
              <AgentToken
                key={agentId}
                agentId={agentId}
                position={agentState.position}
                hp={agentState.hp}
                maxHp={agentState.maxHp}
                isEliminated={agentState.isEliminated}
                isGhost={agentState.isGhost}
                signatureColor={profile.signatureColor}
                name={profile.name}
                isSelected={selectedAgentId === agentId}
              />
            );
          })}

          {/* Drama indicator */}
          <DramaIndicator score={dramaScore} />

          {/* Combat particles */}
          {gameState.activeCombatPositions?.map((pos, idx) => (
            <CombatParticles
              key={idx}
              position={[pos.x - 10, 1, pos.y - 10]}
              active={true}
            />
          ))}
        </Suspense>
      </Canvas>

      {/* PIP overlay */}
      {showPIP && pipMatchState && pipAgentProfiles && (
        <div className="absolute bottom-16 right-4 w-64 h-48 border-2 border-[#FF006E] z-10 overflow-hidden">
          <Canvas
            shadows={false}
            gl={{ antialias: false, alpha: false }}
            style={{ background: '#0a0a0f' }}
            camera={{ position: [0, 20, 0], fov: 60, near: 0.1, far: 200 }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <pointLight position={[0, 10, 0]} intensity={1} color="#FF006E" />
              <ArenaGrid gameState={pipMatchState} />
              {Object.entries(pipMatchState.agents).map(([agentId, agentState]) => {
                const profile = pipAgentProfiles[agentId];
                if (!profile) return null;
                return (
                  <AgentToken
                    key={agentId}
                    agentId={agentId}
                    position={agentState.position}
                    hp={agentState.hp}
                    maxHp={agentState.maxHp}
                    isEliminated={agentState.isEliminated}
                    isGhost={agentState.isGhost}
                    signatureColor={profile.signatureColor}
                    name={profile.name}
                    isSelected={false}
                  />
                );
              })}
            </Suspense>
          </Canvas>
          <div className="absolute top-1 left-1 text-xs font-mono text-[#FF006E] bg-[#0a0a0f]/80 px-1">
            PIP — MATCH 2
          </div>
        </div>
      )}

      {/* HUD overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-[#0d0d1a]/90 border border-[#1a2a1a] px-3 py-2 text-xs font-mono space-y-1">
          <div className="flex gap-2">
            <span className="text-gray-400">TURN</span>
            <span className="text-[#39FF14]">{gameState.currentTurn}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400">PHASE</span>
            <span className="text-[#00D4FF]">{gameState.currentPhase}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400">ALIVE</span>
            <span className="text-[#39FF14]">
              {Object.values(gameState.agents).filter((a: AgentGameState) => !a.isEliminated).length}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400">DRAMA</span>
            <span className={dramaScore > 70 ? 'text-[#FF006E]' : dramaScore > 40 ? 'text-[#FFD60A]' : 'text-[#39FF14]'}>
              {Math.round(dramaScore)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
