'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GlitchShaderProps {
  intensity: number;
  active: boolean;
}

// Custom glitch shader material
const glitchVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const glitchFragmentShader = `
  uniform float time;
  uniform float intensity;
  uniform sampler2D tDiffuse;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv;
    float glitch = intensity * 0.02;

    if (random(vec2(floor(uv.y * 20.0), time)) > 0.95) {
      uv.x += (random(vec2(time, uv.y)) - 0.5) * glitch * 4.0;
    }

    vec4 color = texture2D(tDiffuse, uv);
    color.r = texture2D(tDiffuse, uv + vec2(glitch, 0.0)).r;
    color.b = texture2D(tDiffuse, uv - vec2(glitch, 0.0)).b;

    gl_FragColor = color;
  }
`;

export default function GlitchShader({ intensity, active }: GlitchShaderProps) {
  // This component provides shader uniforms — used as a post-processing effect
  // In production: integrate with @react-three/postprocessing
  return null;
}

export { glitchVertexShader, glitchFragmentShader };
