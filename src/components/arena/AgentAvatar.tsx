'use client';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Pure Three.js Billboard (no drei)
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
    if (groupRef.current) groupRef.current.quaternion.copy(camera.quaternion);
  });
  return <group ref={groupRef} position={position}>{children}</group>;
}

// Pure Three.js Text (canvas texture, no drei)
function TextLabel({ text, fontSize = 0.2, color = '#ffffff' }: {
  text: string; fontSize?: number; color?: string;
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

export default function AgentAvatar({
  position, color, name, hp, maxHp, isActive, isEliminated, onClick,
}: AgentAvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (!meshRef.current || isEliminated) return;
    meshRef.current.position.y = position[1] + Math.sin(t.current * 2) * 0.05;
    if (isActive && glowRef.current) {
      const scale = 1 + Math.sin(t.current * 8) * 0.1;
      glowRef.current.scale.setScalar(scale);
    }
  });

  const hpPercent = maxHp > 0 ? hp / maxHp : 0;
  const hpColor = hpPercent > 0.6 ? '#00ff88' : hpPercent > 0.3 ? '#ffaa00' : '#ff4444';

  if (isEliminated) {
    return (
      <group position={position}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 8]} />
          <meshStandardMaterial color="#333" transparent opacity={0.5} />
        </mesh>
        {/* Pure Three.js Billboard + TextLabel */}
        <BillboardGroup position={[0, 0.5, 0]}>
          <TextLabel text={`${name} X`} fontSize={0.2} color="#666666" />
        </BillboardGroup>
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
      {/* Name label — pure Three.js Billboard + TextLabel */}
      <BillboardGroup position={[0, 0.9, 0]}>
        <TextLabel text={name} fontSize={0.18} color={color} />
      </BillboardGroup>
      {/* HP bar — pure Three.js Billboard */}
      <BillboardGroup position={[0, 0.65, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.6, 0.06]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[-(0.6 * (1 - hpPercent)) / 2, 0, 0.001]}>
          <planeGeometry args={[0.6 * hpPercent, 0.06]} />
          <meshBasicMaterial color={hpColor} />
        </mesh>
      </BillboardGroup>
    </group>
  );
}
