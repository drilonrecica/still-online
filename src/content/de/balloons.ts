// German tray balloons, same exports as `src/content/balloons`. The system speaks „Sie“.
import type { Contact } from '../types';
import type { ScheduledBalloon } from '../balloons';
import type { BalloonIcon } from '@/os/serviceTypes';
import {
  friendsChangedOn,
  SCHEDULED_BALLOONS as EN_BALLOONS,
} from '../balloons';

export type { BalloonAction, ScheduledBalloon } from '../balloons';
export { friendsChangedOn };

/** German text per English balloon, same order; ids, delays, icons and actions stay English. */
const TEXTS: readonly {
  title: string;
  text: string;
  /** Replaces the English action's inline balloon text. */
  inline?: { title: string; text: string };
}[] = [
  {
    title: 'Auf Ihrem Desktop befinden sich nicht verwendete Symbole',
    text: 'Klicken Sie hier, damit der Assistent zum Bereinigen des Desktops aufräumt.',
  },
  {
    title: 'Updates für Ihren Computer stehen bereit',
    text: 'Klicken Sie hier, um die Updates zu installieren.',
    inline: {
      title: 'Updates werden installiert (1 von 47)…',
      text: 'Bitte warten Sie, während die Updates installiert werden.',
    },
  },
  {
    title: 'VirusGuard 2007: Ihr Abonnement ist abgelaufen!',
    text: 'Ihr Computer ist möglicherweise gefährdet.',
  },
  {
    title: 'Jemand Neues ist eingezogen',
    text: 'Klicken Sie auf das Schaf im Infobereich, um Flocke kennenzulernen!',
  },
];

export const SCHEDULED_BALLOONS: readonly ScheduledBalloon[] = EN_BALLOONS.map(
  (b, i) => {
    const t = TEXTS[i]!;
    const action =
      b.action?.kind === 'balloon' && t.inline
        ? { ...b.action, ...t.inline }
        : b.action;
    return { ...b, title: t.title, text: t.text, action };
  },
);

/** Shown every time the modem connects (no id). */
export const CONNECTED_BALLOON: {
  title: (kbps: number) => string;
  text: string;
  icon: BalloonIcon;
} = {
  title: (kbps: number) =>
    `Verbindung mit ${kbps.toFixed(1)} KBit/s hergestellt`,
  text: 'Die DFÜ-Verbindung ist jetzt aktiv.',
  icon: 'network',
};

export { DAY_BALLOON_DELAY_MS } from '../balloons';

export const WELCOME_BALLOON = {
  id: 'welcome',
  title: 'Willkommen an Ihrem neuen Computer!',
  text: 'Klicken Sie hier, um eine Verbindung mit dem Internet herzustellen.',
};

/** Text of the "new day" balloon: a count on days 2–5, a vague line from day 6 on. */
export function newDayBalloonText(
  contacts: readonly Contact[],
  day: number,
): string {
  const n = day >= 6 ? 0 : friendsChangedOn(contacts, day);
  if (n === 0) return 'Ihre Freunde führen etwas im Schilde.';
  return n === 1
    ? 'Ein Freund hat seine persönliche Nachricht geändert.'
    : `${n} Freunde haben ihre persönliche Nachricht geändert.`;
}
