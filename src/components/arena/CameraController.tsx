'use client';
import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type CameraMode = 'overview' | 'pip' | 'cinematic' | 'follow';

interface CameraControllerProps {
  mode: CameraMode;
  target?: THREE.Vector3;
  dramaScore: number;
}

export default function CameraController({ mode, target, dramaScore }: CameraControllerProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 15, 12));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const t = useRef(0);

  useEffect(() => {
    switch (mode) {
      case 'overview':
        targetPos.current.set(0, 20, 15);
        targetLook.current.set(0, 0, 0);
        break;
      case 'cinematic':
        if (target) {
          targetPos.current.set(target.x + 5, target.y + 4, target.z + 5);
          targetLook.current.copy(target);
        }
        break;
      case 'follow':
        if (target) {
          targetPos.current.set(target.x, target.y + 8, target.z + 6);
          targetLook.current.copy(target);
        }
        break;
    }
  }, [mode, target]);

  useFrame((_, delta) => {
    t.current += delta;

    // Smooth camera movement
    camera.position.lerp(targetPos.current, 0.05);
    camera.lookAt(targetLook.current);

    // Cinematic shake on high drama
    if (dramaScore > 80 && mode === 'cinematic') {
      camera.position.x += Math.sin(t.current * 30) * 0.02;
      camera.position.y += Math.cos(t.current * 25) * 0.01;
    }
  });

  return null;
}
