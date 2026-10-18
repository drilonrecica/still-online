// Starts the scheduled balloons when the desktop mounts. Each timer is armed on install and
// dropped on cleanup, so boot, login and off never show balloons.
import { DAY_BALLOON_DELAY_MS, SCHEDULED_BALLOONS } from '@/content/balloons';
import type { BalloonAction } from '@/content/balloons';
import { getBalloons, getContacts } from '@/content/locale';
import { getGender } from '@/i18n/settingsText';
import { getLocale, t } from '@/i18n/t';
import { events } from '@/os/events';
import { requireOnline } from '@/os/network';
import type { BalloonInput } from '@/os/serviceTypes';
import { scaleMs } from '@/os/speed';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { currentDay } from '@/os/world';
import { useBalloonStore } from './store';

const MINUTE_MS = 60_000;

// `world:dayChanged` fires at boot, before the desktop mounts; remember it until balloons install.
let pendingNewDay: number | null = null;
events.on('world:dayChanged', ({ day }) => {
  pendingNewDay = day;
});

function runAction(action: BalloonAction): void {
  switch (action.kind) {
    case 'openApp':
      try {
        useWindowsStore.getState().openApp(action.app);
      } catch (error) {
        // The joke app may not be registered yet; a missing app is not worth breaking the click.
        console.warn('[balloon] could not open app', action.app, error);
      }
      return;
    case 'connect':
      void requireOnline();
      return;
    case 'browse':
      events.emit('browser:open', { url: action.url });
      return;
    case 'pet':
      useSettingsStore.getState().setPetEnabled(true);
      return;
    case 'balloon':
      useBalloonStore.getState().push({
        title: action.title,
        text: action.text,
        icon: action.icon,
      });
  }
}

/** Balloon text in the language and gender at the moment it shows. */
const text = () => getBalloons(getLocale(), getGender());

/** Returns a cleanup that cancels pending timers and clears the queue. */
export function installBalloons(): () => void {
  const day = currentDay();
  const timers = SCHEDULED_BALLOONS.flatMap((scheduled, index) => {
    if (day < scheduled.minDay) return [];
    const id = scheduled.id(day);
    return setTimeout(
      () => {
        // Same order in every locale; timing comes from English.
        const b = text().SCHEDULED_BALLOONS[index] ?? scheduled;
        const { action } = b;
        const balloon: BalloonInput = {
          id,
          title: b.title,
          text: b.text,
          icon: b.icon,
          onClick: action ? () => runAction(action) : undefined,
        };
        useBalloonStore.getState().push(balloon);
      },
      scaleMs(scheduled.afterMinutes * MINUTE_MS),
    );
  });

  const dayBalloons: ReturnType<typeof setTimeout>[] = [];
  const newDay = pendingNewDay;
  pendingNewDay = null;
  if (newDay !== null) {
    dayBalloons.push(
      setTimeout(
        () =>
          useBalloonStore.getState().push({
            id: `newday-${newDay}`,
            title: t('balloon.newDay'),
            text: text().newDayBalloonText(
              getContacts(getLocale(), getGender()).map((c) => c.contact),
              newDay,
            ),
            onClick: () => runAction({ kind: 'openApp', app: 'messenger' }),
          }),
        scaleMs(DAY_BALLOON_DELAY_MS),
      ),
    );
  } else if (day === 1) {
    dayBalloons.push(
      setTimeout(() => {
        const { WELCOME_BALLOON } = text();
        useBalloonStore.getState().push({
          id: WELCOME_BALLOON.id,
          title: WELCOME_BALLOON.title,
          text: WELCOME_BALLOON.text,
          onClick: () => runAction({ kind: 'connect' }),
        });
      }, scaleMs(DAY_BALLOON_DELAY_MS)),
    );
  }

  const offConnected = events.on('network:connected', ({ kbps }) => {
    const { CONNECTED_BALLOON } = text();
    useBalloonStore.getState().push({
      title: CONNECTED_BALLOON.title(kbps),
      text: CONNECTED_BALLOON.text,
      icon: CONNECTED_BALLOON.icon,
    });
  });

  return () => {
    timers.forEach(clearTimeout);
    dayBalloons.forEach(clearTimeout);
    offConnected();
    useBalloonStore.getState().clear();
  };
}
