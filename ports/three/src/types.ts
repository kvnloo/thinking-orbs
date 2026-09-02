import type { Scene } from 'three';
import type { OrbSize, OrbState } from 'thinking-orbs/engine';

export type OrbTheme = 'auto' | 'dark' | 'light';

export interface ThinkingOrbOptions {
  state?: OrbState;
  size?: OrbSize;
  theme?: OrbTheme;
  speed?: number;
  paused?: boolean;
  dark?: boolean;
  /** If provided, the orb Object3D is added to this scene. */
  scene?: Scene;
}
