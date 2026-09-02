// The Mitosis-authored ThinkingOrb. One source compiles to React, Vue,
// Svelte and Solid; every imperative behaviour lives in the shared
// `orb-controller`, which drives the framework-neutral `thinking-orbs/engine`
// geometry. This component only owns the canvas, its ref, and the prop→props
// wiring, so the generated outputs stay thin and identical in behaviour.
//
// Note: the override label prop is `ariaLabel` (camelCase) because Mitosis'
// Vue generator cannot reference a bracketed `props['aria-label']`; it is
// still rendered as an `aria-label` attribute on the canvas.

import { onMount, onUnMount, onUpdate, useRef } from '@builder.io/mitosis';
import {
  attachController,
  createOrbController,
  controllerProps,
  getController,
} from './orb-controller';
import { LABELS, type OrbSize, type OrbState, type OrbTheme } from './types';

export interface ThinkingOrbProps {
  state?: OrbState;
  size?: OrbSize;
  theme?: OrbTheme;
  speed?: number;
  paused?: boolean;
  ariaLabel?: string;
}

export default function ThinkingOrb(props: ThinkingOrbProps) {
  const canvas = useRef<HTMLCanvasElement | null>(null);

  onMount(() => {
    const el = canvas;
    if (!el) return;
    attachController(
      el,
      createOrbController(
        el,
        controllerProps({
          state: props.state,
          size: props.size,
          theme: props.theme,
          speed: props.speed,
          paused: props.paused,
        }),
      ),
    );
  });

  onUpdate(
    () => {
      const el = canvas;
      const ctl = getController(el);
      if (ctl) {
        ctl.applyProps(
          controllerProps({
            state: props.state,
            size: props.size,
            theme: props.theme,
            speed: props.speed,
            paused: props.paused,
          }),
        );
      }
    },
    [props.state, props.size, props.theme, props.speed, props.paused],
  );

  onUnMount(() => {
    const el = canvas;
    const ctl = getController(el);
    if (ctl) ctl.dispose();
  });

  return (
    <canvas
      ref={canvas}
      role="img"
      aria-label={props.ariaLabel || LABELS[props.state ?? 'working']}
      style={{
        width: props.size ?? 64,
        height: props.size ?? 64,
        display: 'block',
      }}
    />
  );
}
