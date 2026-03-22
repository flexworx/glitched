'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useRef, useMemo } from 'react';
import * as THREE from 'three';

// Pure Three.js star field (no drei)
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
    if (pointsRef.current) pointsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
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

// Custom orbit controls (no drei)
function CustomOrbitControls({
  enablePan = true, enableZoom = true, enableRotate = true,
  maxPolarAngle = Math.PI / 2, minDistance = 5, maxDistance = 50,
}: {
  enablePan?: boolean; enableZoom?: boolean; enableRotate?: boolean;
  maxPolarAngle?: number; minDistance?: number; maxDistance?: number;
}) {
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const lastMouse  = useRef({ x: 0, y: 0 });
  const spherical  = useRef({ theta: 0, phi: Math.PI / 4, radius: 25 });

  useFrame(() => {
    const s = spherical.current;
    s.phi = Math.max(0.1, Math.min(maxPolarAngle, s.phi));
    s.radius = Math.max(minDistance, Math.min(maxDistance, s.radius));
    camera.position.set(
      s.radius * Math.sin(s.phi) * Math.sin(s.theta),
      s.radius * Math.cos(s.phi),
      s.radius * Math.sin(s.phi) * Math.cos(s.theta),
    );
    camera.lookAt(0, 0, 0);
  });

  return null;
}

interface ArenaCanvasProps {
  children: React.ReactNode;
  mode?: 'overview' | 'cinematic';
}

export function ArenaCanvas({ children, mode = 'overview' }: ArenaCanvasProps) {
  return (
    <Canvas
      camera={{
        position: mode === 'overview' ? [0, 25, 0] : [5, 8, 12],
        fov: mode === 'overview' ? 60 : 45,
        near: 0.1,
        far: 1000,
      }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#080810' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]}   intensity={1}   color="#00ff88" />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#0ea5e9" />
        {/* Pure Three.js star field — ZERO drei */}
        <StarField radius={100} depth={50} count={3000} />
        {/* Custom orbit controls — ZERO drei */}
        <CustomOrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={50}
        />
        {children}
      </Suspense>
    </Canvas>
  );
}

export default ArenaCanvas;
