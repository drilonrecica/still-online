// Scheduled tray balloons. The scheduler (`os/balloon/schedule.ts`) turns these into pushes.
import type { BalloonIcon } from '@/os/serviceTypes';

/** What clicking a balloon does; resolved by the scheduler so content stays free of OS imports. */
export type BalloonAction =
  | { kind: 'openApp'; app: 'diskcleanup' }
  | { kind: 'browse'; url: string }
  | { kind: 'balloon'; title: string; text: string; icon?: BalloonIcon };

export interface ScheduledBalloon {
  /** Show-once id for a given day (a day-free id means once ever). */
  id: (day: number) => string;
  /** Minutes on the desktop before it appears. */
  afterMinutes: number;
  /** First day it appears on. */
  minDay: number;
  title: string;
  text: string;
  icon?: BalloonIcon;
  action?: BalloonAction;
}

export const SCHEDULED_BALLOONS: readonly ScheduledBalloon[] = [
  {
    id: () => 'unused-icons',
    afterMinutes: 3,
    minDay: 1,
    title: 'There are unused icons on your desktop',
    text: 'Click here to have Desktop Cleanup Wizard clean up your desktop.',
    action: { kind: 'openApp', app: 'diskcleanup' },
  },
  {
    id: (day) => `updates-${day}`,
    afterMinutes: 8,
    minDay: 1,
    title: 'Updates are ready for your computer',
    text: 'Click here to install these updates.',
    icon: 'warning',
    action: {
      kind: 'balloon',
      title: 'Installing updates (1 of 47)…',
      text: 'Please wait while updates are installed.',
    },
  },
  {
    id: (day) => `virusguard-${day}`,
    afterMinutes: 12,
    minDay: 2,
    title: 'VirusGuard 2007: Your subscription has expired!',
    text: 'Your computer might be at risk.',
    icon: 'shield',
    action: { kind: 'browse', url: 'http://virusguard.example' },
  },
];

/** Shown every time the modem connects (no id). */
export const CONNECTED_BALLOON = {
  title: (kbps: number) => `Connected at ${kbps.toFixed(1)} Kbps`,
  text: 'Dial-up Connection is now active.',
  icon: 'network',
} as const satisfies {
  title: (kbps: number) => string;
  text: string;
  icon: BalloonIcon;
};
