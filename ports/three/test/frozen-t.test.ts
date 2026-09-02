import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { MODE_FRAMES, resolvePreset } from 'thinking-orbs/engine';
import { createThinkingOrb } from '../src/createThinkingOrb';

const EPS = 1e-4;
const goldenPath = path.resolve(__dirname, '../../../spec/orbs-golden.json');

describe('thinking-orbs three renderer', () => {
  it('does not construct a WebGLRenderer', () => {
    const orb = createThinkingOrb({ state: 'working', size: 64, theme: 'dark' });
    expect(orb.object).toBeInstanceOf(THREE.Group);
    expect(orb.dots).toBeInstanceOf(THREE.InstancedMesh);
    expect(orb.lines).toBeInstanceOf(THREE.LineSegments);
    orb.dispose();
  });
});

describe('frozen t matches engine', () => {
  it('instance matrices and line buffers match engine frames', () => {
    const golden = JSON.parse(readFileSync(goldenPath, 'utf8'));
    const dummy = new THREE.Object3D();
    const mat = new THREE.Matrix4();

    for (const c of golden.cases) {
      const resolved = resolvePreset(c.state, c.size);
      const engine = MODE_FRAMES[resolved.mode](c.size, c.t, resolved.opts);
      expect(engine.dots.length).toBe(c.dotCount);
      expect(engine.lines.length).toBe(c.lineCount);

      const orb = createThinkingOrb({ state: c.state, size: c.size, theme: 'dark' });
      const applied = orb.update(c.t);
      expect(applied.dots.length).toBe(engine.dots.length);
      expect(orb.dots.count).toBe(engine.dots.length);

      for (let i = 0; i < engine.dots.length; i++) {
        const d = engine.dots[i];
        orb.dots.getMatrixAt(i, mat);
        dummy.matrix.copy(mat);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        expect(Math.abs(dummy.position.x - d.x)).toBeLessThanOrEqual(EPS);
        expect(Math.abs(dummy.position.y - d.y)).toBeLessThanOrEqual(EPS);
        expect(Math.abs(dummy.scale.x - d.r)).toBeLessThanOrEqual(EPS);
      }

      const pos = orb.lines.geometry.getAttribute('position');
      expect(orb.lines.geometry.drawRange.count).toBe(engine.lines.length * 2);
      for (let i = 0; i < engine.lines.length; i++) {
        const l = engine.lines[i];
        expect(Math.abs(pos.getX(i * 2) - l.x1)).toBeLessThanOrEqual(EPS);
        expect(Math.abs(pos.getY(i * 2) - l.y1)).toBeLessThanOrEqual(EPS);
        expect(Math.abs(pos.getX(i * 2 + 1) - l.x2)).toBeLessThanOrEqual(EPS);
        expect(Math.abs(pos.getY(i * 2 + 1) - l.y2)).toBeLessThanOrEqual(EPS);
      }
      orb.dispose();
    }
  });
});
