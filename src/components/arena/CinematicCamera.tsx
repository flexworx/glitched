'use client';
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CinematicCameraProps {
  focusPoint: THREE.Vector3;
  dramaScore: number;
  active: boolean;
}

const CINEMATIC_POSITIONS = [
  new THREE.Vector3(8, 5, 8),
  new THREE.Vector3(-8, 3, 6),
  new THREE.Vector3(0, 12, 10),
  new THREE.Vector3(6, 2, -6),
];

export default function CinematicCamera({ focusPoint, dramaScore, active }: CinematicCameraProps) {
  const { camera } = useThree();
  const shotIndex = useRef(0);
  const shotTimer = useRef(0);
  const SHOT_DURATION = dramaScore > 70 ? 3 : 6;

  useFrame((_, delta) => {
    if (!active) return;

    shotTimer.current += delta;
    if (shotTimer.current > SHOT_DURATION) {
      shotTimer.current = 0;
      shotIndex.current = (shotIndex.current + 1) % CINEMATIC_POSITIONS.length;
    }

    const targetPos = CINEMATIC_POSITIONS[shotIndex.current].clone().add(focusPoint);
    camera.position.lerp(targetPos, 0.03);
    camera.lookAt(focusPoint);

    // Subtle shake on high drama
    if (dramaScore > 85) {
      camera.position.x += (Math.random() - 0.5) * 0.02;
    }
  });

  return null;
}
