// Fluff the sheep: the `pet` overlay. A thin view over the pure state machine, ticked at 20 Hz
// against the taskbar and window title bars. See docs/architecture-v0.2.md → "Fluff".
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { getApp } from '@/apps/registry';
import { useT } from '@/i18n/useT';
import { mulberry32, seedFrom } from '@/os/random';
import { playSound } from '@/os/sound';
import { useSettingsStore } from '@/os/store/settings';
import { getDevice } from '@/os/device';
import { effectiveMaximized, useWindowsStore } from '@/os/store/windows';
import { TASKBAR_HEIGHT } from '@/os/types';
import { useReducedMotion } from '@/os/useReducedMotion';
import { dragTo, grab, release } from './drag';
import {
  baa,
  PET_H,
  PET_W,
  rest,
  spawn,
  tick,
  TICK_MS,
  type PetState,
  type PetWorld,
} from './machine';
import { SheepSprite } from './SheepSprite';
import { computeSurfaces } from './surfaces';
import styles from './Pet.module.css';

/** Blink for BLINK_MS out of every BLINK_EVERY_MS. */
const BLINK_EVERY_MS = 3400;
const BLINK_MS = 150;

/** The current surfaces, read fresh from the windows store. */
function readWorld(): PetWorld {
  const { windows } = useWindowsStore.getState();
  const device = getDevice();
  const chromeless = new Set(
    windows
      .filter((win) => getApp(win.appId)?.chrome === 'none')
      .map((win) => win.id),
  );
  const viewport = { w: window.innerWidth, h: window.innerHeight };
  return {
    surfaces: computeSurfaces({
      windows: windows.map((win) => ({
        ...win,
        maximized: effectiveMaximized(win, device),
      })),
      viewport,
      taskbarHeight: TASKBAR_HEIGHT,
      hasTitleBar: (id) => !chromeless.has(id),
    }),
    width: viewport.w,
    height: viewport.h,
  };
}

function Fluff() {
  const reduced = useReducedMotion();
  const t = useT();
  const rng = useMemo(() => mulberry32(seedFrom('fluff')), []);
  const [pet, setPet] = useState<PetState>(() =>
    reduced ? rest(null, readWorld(), 0) : spawn(readWorld(), rng),
  );
  const ref = useRef(pet);
  const update = (next: PetState) => {
    ref.current = next;
    setPet(next);
  };

  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      const world = readWorld();
      const current = ref.current;
      const next = reduced
        ? rest(current, world, TICK_MS)
        : tick(current, world, TICK_MS, rng);
      ref.current = next;
      setPet(next);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [reduced, rng]);

  function bleat(next: PetState) {
    if (next.mode === 'baa' && next.modeMs === 0) playSound('baa');
    update(next);
  }

  function onPointerDown(e: ReactPointerEvent<HTMLButtonElement>) {
    if (reduced || e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    update(grab(ref.current, e.clientX, e.clientY, e.timeStamp));
  }
  function onPointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    if (ref.current.mode !== 'drag') return;
    update(dragTo(ref.current, e.clientX, e.clientY, e.timeStamp, readWorld()));
  }
  function onPointerUp(e: ReactPointerEvent<HTMLButtonElement>) {
    if (ref.current.mode !== 'drag') return;
    bleat(release(ref.current, e.timeStamp, rng));
  }

  const frame = Math.floor(pet.t / (pet.mode === 'graze' ? 220 : 160)) % 2;
  const blink = pet.t % BLINK_EVERY_MS < BLINK_MS;
  return (
    <div
      className={styles.pet}
      data-pet
      data-mode={pet.mode}
      style={{
        transform: `translate(${Math.round(pet.x - PET_W / 2)}px, ${Math.round(pet.y - PET_H)}px)`,
      }}
    >
      {pet.mode === 'baa' && (
        <span className={styles.bubble} aria-hidden="true">
          {t('pet.baa')}
        </span>
      )}
      {pet.mode === 'sleep' && (
        <span className={styles.zzz} aria-hidden="true">
          z<span>Z</span>
        </span>
      )}
      <button
        type="button"
        className={styles.sheep}
        aria-label={t('pet.label')}
        title={t('pet.name')}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        // Keyboard clicks (detail 0) bleat; pointer clicks are handled by release().
        onClick={(e) => {
          if (reduced || e.detail === 0) bleat(baa(ref.current, rng));
        }}
      >
        <span
          className={styles.flip}
          style={{ transform: pet.dir === -1 ? 'scaleX(-1)' : undefined }}
        >
          <SheepSprite mode={pet.mode} frame={frame} blink={blink} />
        </span>
      </button>
    </div>
  );
}

/** Fluff, while `settings.petEnabled` is on. */
export function Pet() {
  const enabled = useSettingsStore((s) => s.petEnabled);
  return enabled ? <Fluff /> : null;
}
