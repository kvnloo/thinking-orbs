// Mode key → geometry builder. Kept separate from the presets so tree
// shaking can in principle drop unused modes in custom builds.

import type { ModeKey } from '../presets';
import type { ModeDraw, ModeFrame } from './types';
import { paintFrame } from './core';
import { frameBraid } from './braid';
import { drawCosmic, drawLiquid, drawNebula, drawNova } from './cosmic';
import { frameGlobe, frameRubik, frameWave } from './lattice';
import { frameMorph } from './morph';
import { frameOrbits } from './orbits';
import { frameRibbon } from './ribbon';
import { frameTwist } from './twist';
import { frameWeb } from './web';

/**
 * The portable dotted-geometry surface. Cosmic/nebula/liquid/nova are
 * gradient painters (not ModeFrame) and live only on MODE_DRAWS.
 */
export const MODE_FRAMES: Record<Exclude<ModeKey, 'cosmic' | 'nebula' | 'liquid' | 'nova'>, ModeFrame> = {
  orbits: frameOrbits,
  globe: frameGlobe,
  rubik: frameRubik,
  wave: frameWave,
  twist: frameTwist,
  web: frameWeb,
  braid: frameBraid,
  ribbon: frameRibbon,
  ring: frameRibbon,
  morph: frameMorph
};

const FRAME_DRAWS: Record<string, ModeDraw> = Object.fromEntries(
  Object.entries(MODE_FRAMES).map(([key, frame]) => [
    key,
    ((ctx, size, t, dark, opts, color) => paintFrame(ctx, frame(size, t, opts), dark, color)) as ModeDraw
  ])
);

export const MODE_DRAWS: Record<ModeKey, ModeDraw> = {
  ...(FRAME_DRAWS as Record<Exclude<ModeKey, 'cosmic' | 'nebula' | 'liquid' | 'nova'>, ModeDraw>),
  cosmic: drawCosmic,
  nebula: drawNebula,
  liquid: drawLiquid,
  nova: drawNova
};
