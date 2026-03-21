'use client';

import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Text, Billboard } from '@react-three/drei';
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
  overview: { position: [0, 35, 0], target: [0, 0, 0], fov: 65 },
  trackside: { position: [22, 12, 22], target: [0, 0, 0], fov: 50 },
  dramatic: { position: [8, 4, 12], target: [0, 1, 0], fov: 40 },
  pip: { position: [5, 8, 5], target: [0, 0, 0], fov: 45 },
  redzoneA: { position: [-20, 10, 20], target: [0, 0, 0], fov: 50 },
  redzoneB: { position: [20, 10, -20], target: [0, 0, 0], fov: 50 },
};

// ============================================================
// TERRAIN COLORS
// ============================================================
const TERRAIN_COLORS: Record<string, string> = {
  plains: '#1a2a1a',
  mountains: '#3a3a4a',
  water: '#0a1a3a',
  forest: '#0a2a0a',
  lava: '#3a0a00',
  crystal: '#1a0a3a',
  ruins: '#2a2a1a',
  void: '#050508',
};

// ============================================================
// ARENA TILE
// ============================================================
function ArenaTile({
  x, y, terrain, isVisible, hasResource, hasHazard, occupantId, isHighlighted,
}: {
  x: number; y: number; terrain: string; isVisible: boolean;
  hasResource?: boolean; hasHazard?: boolean; occupantId?: string; isHighlighted?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = TERRAIN_COLORS[terrain] || TERRAIN_COLORS.plains;
  const opacity = isVisible ? 1 : 0.3;

  useFrame((state) => {
    if (meshRef.current && isHighlighted) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  return (
    <group position={[x - 10, 0, y - 10]}>
      {/* Base tile */}
      <mesh ref={meshRef} receiveShadow>
        <boxGeometry args={[0.95, 0.1, 0.95]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          emissive={isHighlighted ? '#39FF14' : color}
          emissiveIntensity={isHighlighted ? 0.3 : 0.05}
        />
      </mesh>

      {/* Grid lines */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.95, 0.1, 0.95)]} />
        <lineBasicMaterial color="#39FF14" transparent opacity={0.15} />
      </lineSegments>

      {/* Resource indicator */}
      {hasResource && isVisible && (
        <mesh position={[0, 0.15, 0]}>
          <octahedronGeometry args={[0.12]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.8} />
        </mesh>
      )}

      {/* Hazard indicator */}
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
  agentId, position, hp, maxHp, isEliminated, isGhost, signatureColor, name, isSelected,
}: {
  agentId: string; position: Position; hp: number; maxHp: number;
  isEliminated: boolean; isGhost: boolean; signatureColor: string;
  name: string; isSelected: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const hpRatio = hp / maxHp;

  useFrame((state) => {
    if (!groupRef.current) return;
    if (isGhost) {
      groupRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
      groupRef.current.rotation.y += 0.01;
    } else if (isSelected) {
      groupRef.current.rotation.y += 0.02;
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });

  if (isEliminated && !isGhost) return null;

  const color = isGhost ? '#7B2FBE' : signatureColor;
  const height = isGhost ? 1.5 : 0.8;

  return (
    <group
      ref={groupRef}
      position={[position.x - 10, height / 2, position.y - 10]}
    >
      {/* Agent body */}
      <mesh ref={glowRef} castShadow>
        <cylinderGeometry args={[0.3, 0.35, height, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent={isGhost}
          opacity={isGhost ? 0.6 : 1.0}
        />
      </mesh>

      {/* Agent top cap */}
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
        <mesh position={[0, -height / 2 + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 16]} />
          <meshBasicMaterial color="#39FF14" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Agent name label */}
      <Billboard position={[0, height + 0.6, 0]}>
        <Text
          fontSize={0.2}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {name}
        </Text>
      </Billboard>

      {/* Ghost indicator */}
      {isGhost && (
        <Billboard position={[0, height + 1.0, 0]}>
          <Text fontSize={0.15} color="#7B2FBE" anchorX="center" anchorY="middle">
            [GHOST]
          </Text>
        </Billboard>
      )}
    </group>
  );
}

// ============================================================
// ARENA GRID
// ============================================================
function ArenaGrid({ gameState }: { gameState: GameState }) {
  const { board } = gameState;

  return (
    <group>
      {board.tiles.map((row, y) =>
        row.map((tile, x) => (
          <ArenaTile
            key={`${x}-${y}`}
            x={x}
            y={y}
            terrain={tile.terrain}
            isVisible={tile.isVisible}
            hasResource={tile.hasResource}
            hasHazard={tile.hasHazard}
            occupantId={tile.occupantId}
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
  const fogRef = useRef<THREE.FogExp2>(null);
  const { scene } = useThree();

  useEffect(() => {
    const fog = new THREE.FogExp2('#0a0a0f', 0.02 + dramaScore * 0.0003);
    scene.fog = fog;
    return () => { scene.fog = null; };
  }, [dramaScore, scene]);

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.3} color="#1a1a2e" />

      {/* Main directional light */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Neon accent lights */}
      <pointLight position={[0, 5, 0]} intensity={1.5} color="#39FF14" distance={20} />
      <pointLight position={[-10, 3, -10]} intensity={0.8} color="#00D4FF" distance={15} />
      <pointLight position={[10, 3, 10]} intensity={0.8} color="#7B2FBE" distance={15} />

      {/* Drama-reactive light */}
      <pointLight
        position={[0, 10, 0]}
        intensity={dramaScore / 50}
        color="#FF006E"
        distance={30}
      />

      {/* Stars */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
    </>
  );
}

// ============================================================
// CAMERA CONTROLLER
// ============================================================
function CameraController({
  mode, focusPosition, autoOrbit,
}: {
  mode: CameraMode; focusPosition?: Position; autoOrbit: boolean;
}) {
  const { camera } = useThree();
  const config = CAMERA_CONFIGS[mode];
  const targetRef = useRef(new THREE.Vector3(...config.target));
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
      const currentTarget = new THREE.Vector3();
      camera.getWorldDirection(currentTarget);
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

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + (score / 100) * 0.7 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
    }
  });

  const color = score > 70 ? '#FF006E' : score > 40 ? '#FFD60A' : '#39FF14';

  return (
    <group position={[12, 0.5, -12]}>
      <mesh ref={meshRef}>
        <torusGeometry args={[0.8, 0.15, 8, 32, (score / 100) * Math.PI * 2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <Billboard position={[0, 1.5, 0]}>
        <Text fontSize={0.25} color={color} anchorX="center">
          DRAMA {Math.round(score)}
        </Text>
      </Billboard>
    </group>
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
  const [localCameraMode, setLocalCameraMode] = useState<CameraMode>(cameraMode);
  const dramaScore = gameState.dramaScore;

  const handleCameraChange = useCallback((mode: CameraMode) => {
    setLocalCameraMode(mode);
    onCameraModeChange?.(mode);
  }, [onCameraModeChange]);

  const focusPosition = selectedAgentId
    ? gameState.agents[selectedAgentId]?.position
    : undefined;

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Main 3D Canvas */}
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0a0a0f' }}
      >
        <Suspense fallback={null}>
          <CameraController
            mode={localCameraMode}
            focusPosition={focusPosition}
            autoOrbit={autoOrbit}
          />

          <ArenaEffects dramaScore={dramaScore} />

          {/* Arena grid */}
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

          {/* Arena boundary */}
          <mesh position={[0, -0.1, 0]} receiveShadow>
            <boxGeometry args={[22, 0.1, 22]} />
            <meshStandardMaterial color="#050508" />
          </mesh>

          {/* Boundary walls (neon) */}
          {[
            { pos: [0, 0.5, -11] as [number, number, number], rot: [0, 0, 0] as [number, number, number] },
            { pos: [0, 0.5, 11] as [number, number, number], rot: [0, 0, 0] as [number, number, number] },
            { pos: [-11, 0.5, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number] },
            { pos: [11, 0.5, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number] },
          ].map((wall, i) => (
            <mesh key={i} position={wall.pos} rotation={wall.rot}>
              <boxGeometry args={[22, 1, 0.1]} />
              <meshStandardMaterial color="#39FF14" emissive="#39FF14" emissiveIntensity={0.3} transparent opacity={0.4} />
            </mesh>
          ))}

          {/* Camera controls for overview mode */}
          {localCameraMode === 'overview' && !autoOrbit && (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              maxPolarAngle={Math.PI / 2.2}
              minDistance={10}
              maxDistance={60}
            />
          )}
        </Suspense>
      </Canvas>

      {/* Camera mode controls overlay */}
      <div className="absolute bottom-4 left-4 flex gap-2 z-10">
        {(['overview', 'trackside', 'dramatic'] as CameraMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => handleCameraChange(mode)}
            className={`px-3 py-1.5 text-xs font-orbitron uppercase tracking-wider border transition-all ${
              localCameraMode === mode
                ? 'bg-neon-green text-arena-black border-neon-green'
                : 'bg-arena-surface text-gray-400 border-arena-border hover:border-neon-green hover:text-neon-green'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Drama score overlay */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-arena-surface border border-arena-border px-3 py-2 text-xs font-orbitron">
          <div className="text-gray-400 uppercase tracking-wider">Drama Score</div>
          <div
            className="text-2xl font-bold"
            style={{ color: dramaScore > 70 ? '#FF006E' : dramaScore > 40 ? '#FFD60A' : '#39FF14' }}
          >
            {Math.round(dramaScore)}
          </div>
        </div>
      </div>

      {/* PIP overlay */}
      {showPIP && pipMatchState && pipAgentProfiles && (
        <div className="absolute bottom-16 right-4 w-64 h-48 border-2 border-neon-pink z-10 overflow-hidden">
          <Canvas
            shadows={false}
            gl={{ antialias: false, alpha: false }}
            style={{ background: '#0a0a0f' }}
          >
            <Suspense fallback={null}>
              <PerspectiveCamera makeDefault position={[0, 20, 0]} fov={60} />
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
          <div className="absolute top-1 left-1 text-xs font-orbitron text-neon-pink bg-arena-black/80 px-1">
            PIP — MATCH 2
          </div>
        </div>
      )}

      {/* Turn/Phase overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-arena-surface border border-arena-border px-3 py-2 text-xs font-orbitron space-y-1">
          <div className="flex gap-2">
            <span className="text-gray-400">TURN</span>
            <span className="text-neon-green">{gameState.currentTurn}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400">PHASE</span>
            <span className="text-electric-blue">{gameState.currentPhase}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400">ALIVE</span>
            <span className="text-status-alive">
              {Object.values(gameState.agents).filter(a => !a.isEliminated).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
