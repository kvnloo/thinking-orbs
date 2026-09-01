// Default accessibility labels per state, shared by the DOM component
// (aria-label) and the React Native component (accessibilityLabel).

import type { OrbState } from './types';

export const LABELS: Record<OrbState, string> = {
  idle: 'Idle',
  thinking: 'Thinking…',
  working: 'Working…',
  searching: 'Searching…',
  solving: 'Solving…',
  listening: 'Listening…',
  connecting: 'Connecting…',
  weaving: 'Weaving…',
  composing: 'Composing…',
  breathing: 'Thinking…',
  shaping: 'Shaping…',
  cleaning: 'Cleaning…',
  success: 'Complete',
  error: 'Error',
  cosmic: 'Processing cosmic data…',
  nebula: 'Synthesizing ideas…',
  liquid: 'Adapting fluid context…',
  nova: 'Generating response…'
};
