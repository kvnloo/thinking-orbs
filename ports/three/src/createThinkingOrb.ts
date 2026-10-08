import * as THREE from 'three';
import { MODE_FRAMES, resolvePreset, type Dot, type Line, type OrbFrame } from 'thinking-orbs/engine';
import type { ThinkingOrbOptions } from './types';

const MAX_DOTS = 700;
const MAX_LINES = 500;
export const REDUCED_MOTION_T = 0.6;

function inkColor(white: number, dark: boolean): THREE.Color {
  const w = Math.min(1, Math.max(0, white));
  const g = Math.round((dark ? 1 - w : w) * 255) / 255;
  return new THREE.Color(g, g, g);
}

export interface ThinkingOrbHandle {
  object: THREE.Object3D;
  dots: THREE.InstancedMesh;
  lines: THREE.LineSegments;
  lastFrame: OrbFrame | null;
  update(t: number): OrbFrame;
  setState(
    state: NonNullable<ThinkingOrbOptions['state']>,
    size?: NonNullable<ThinkingOrbOptions['size']>
  ): void;
  setTheme(dark: boolean): void;
  dispose(): void;
}

export function createThinkingOrb(options: ThinkingOrbOptions = {}): ThinkingOrbHandle {
  let state = options.state ?? 'working';
  let size = options.size ?? 64;
  let dark =
    options.theme === 'light' ? false : options.theme === 'dark' ? true : (options.dark ?? true);

  const group = new THREE.Group();
  group.name = 'ThinkingOrb';
  if (options.scene) options.scene.add(group);

  const circle = new THREE.CircleGeometry(1, 20);
  const dotMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const dots = new THREE.InstancedMesh(circle, dotMat, MAX_DOTS);
  dots.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  dots.frustumCulled = false;
  dots.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX_DOTS * 3), 3);

  const linePos = new Float32Array(MAX_LINES * 2 * 3);
  const lineCol = new Float32Array(MAX_LINES * 2 * 3);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineCol, 3));
  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  lines.frustumCulled = false;

  group.add(lines);
  group.add(dots);

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  let resolved = resolvePreset(state, size);
  let lastFrame: OrbFrame | null = null;

  function apply(frame: OrbFrame): void {
    lastFrame = frame;
    const n = Math.min(frame.dots.length, MAX_DOTS);
    dots.count = n;
    for (let i = 0; i < n; i++) {
      const d: Dot = frame.dots[i];
      dummy.position.set(d.x, d.y, d.z * 0.01);
      dummy.scale.set(d.r, d.r, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      dots.setMatrixAt(i, dummy.matrix);
      color.copy(inkColor(d.white, dark));
      dots.setColorAt(i, color);
    }
    dots.instanceMatrix.needsUpdate = true;
    if (dots.instanceColor) dots.instanceColor.needsUpdate = true;

    const ln = Math.min(frame.lines.length, MAX_LINES);
    for (let i = 0; i < ln; i++) {
      const l: Line = frame.lines[i];
      const o = i * 6;
      linePos[o] = l.x1;
      linePos[o + 1] = l.y1;
      linePos[o + 2] = 0;
      linePos[o + 3] = l.x2;
      linePos[o + 4] = l.y2;
      linePos[o + 5] = 0;
      const c = inkColor(l.white, dark);
      lineCol[o] = c.r;
      lineCol[o + 1] = c.g;
      lineCol[o + 2] = c.b;
      lineCol[o + 3] = c.r;
      lineCol[o + 4] = c.g;
      lineCol[o + 5] = c.b;
    }
    lineGeo.setDrawRange(0, ln * 2);
    (lineGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (lineGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
  }

  function update(t: number): OrbFrame {
    const build = MODE_FRAMES[resolved.mode as keyof typeof MODE_FRAMES];
    const frame = build(size, t, resolved.opts);
    apply(frame);
    return frame;
  }

  return {
    object: group,
    dots,
    lines,
    get lastFrame() {
      return lastFrame;
    },
    update,
    setState(next, nextSize) {
      state = next;
      if (nextSize) size = nextSize;
      resolved = resolvePreset(state, size);
    },
    setTheme(nextDark) {
      dark = nextDark;
      if (lastFrame) apply(lastFrame);
    },
    dispose() {
      circle.dispose();
      dotMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      dots.dispose();
    }
  };
}
