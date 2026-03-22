'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { Suspense } from 'react';

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
      style={{ background: '#080810' }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ff88" />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#0ea5e9" />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="night" />
        <OrbitControls
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
