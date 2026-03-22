'use client';
import { useState, useCallback } from 'react';

export type CameraMode = 'overview' | 'cinematic' | 'pip' | 'redzone';

export interface CameraState {
  mode: CameraMode;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  focusedAgent?: string;
  focusedMatch?: string;
}

const DEFAULT_CAMERA: CameraState = {
  mode: 'overview',
  position: [0, 25, 0],
  target: [0, 0, 0],
  fov: 60,
};

export function useArenaCamera() {
  const [camera, setCamera] = useState<CameraState>(DEFAULT_CAMERA);

  const setMode = useCallback((mode: CameraMode) => {
    const configs: Record<CameraMode, Partial<CameraState>> = {
      overview: { position: [0, 25, 0], target: [0, 0, 0], fov: 60 },
      cinematic: { position: [5, 8, 12], target: [0, 0, 0], fov: 45 },
      pip: { position: [0, 20, 0], target: [0, 0, 0], fov: 55 },
      redzone: { position: [0, 30, 0], target: [0, 0, 0], fov: 70 },
    };
    setCamera(prev => ({ ...prev, mode, ...configs[mode] }));
  }, []);

  const focusAgent = useCallback((agentId: string, position: [number, number, number]) => {
    setCamera(prev => ({
      ...prev,
      mode: 'cinematic',
      focusedAgent: agentId,
      position: [position[0] + 5, position[1] + 8, position[2] + 8],
      target: position,
      fov: 40,
    }));
  }, []);

  const reset = useCallback(() => setCamera(DEFAULT_CAMERA), []);

  return { camera, setMode, focusAgent, reset };
}
