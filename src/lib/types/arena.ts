// Arena types for Glitched.gg
import type { TerrainType, HazardType, Position } from './game-state';

export interface Arena {
  id: string;
  name: string;
  theme: ArenaTheme;
  description: string;
  gridWidth: number;
  gridHeight: number;
  terrainConfig: TerrainConfig;
  hazardConfig: HazardConfig[];
  spawnPoints: Position[];
  resourceNodes: ResourceNode[];
  cameraPaths: CameraPath[];
}

export type ArenaTheme = 'medieval' | 'neon-dystopia' | 'savanna' | 'court-of-whispers' | 'space-station' | 'underwater';

export interface TerrainConfig {
  tiles: Array<{
    position: Position;
    terrain: TerrainType;
    elevation?: number;
  }>;
}

export interface HazardConfig {
  type: HazardType;
  positions: Position[];
  activationTurn: number;
  damage: number;
  duration: number;
}

export interface ResourceNode {
  position: Position;
  type: 'credits' | 'murph' | 'shield' | 'heal' | 'ability';
  amount: number;
  respawnTurns: number;
}

export interface CameraPath {
  name: string;
  type: 'overview' | 'trackside' | 'dramatic' | 'follow';
  keyframes: CameraKeyframe[];
}

export interface CameraKeyframe {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  duration: number;
}

export interface CameraPreset {
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export const CAMERA_PRESETS: CameraPreset[] = [
  { name: 'overview', position: [0, 30, 0], target: [0, 0, 0], fov: 60 },
  { name: 'trackside', position: [20, 10, 20], target: [0, 0, 0], fov: 50 },
  { name: 'dramatic', position: [5, 3, 10], target: [0, 1, 0], fov: 40 },
  { name: 'cinematic', position: [-15, 8, 15], target: [0, 0, 0], fov: 35 },
];
