// Black "safe to turn off" screen shown in the `off` session state.
import { useT } from '@/i18n/useT';
import { useSessionStore } from '@/os/store/session';

export function OffScreen() {
  const powerOn = useSessionStore((s) => s.powerOn);
  const t = useT();
  return (
    <div
      data-testid="off-screen"
      role="button"
      tabIndex={0}
      aria-label={t('startMenu.offScreen.powerOn')}
      onClick={powerOn}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') powerOn();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: '#000',
        color: '#ff9a00',
        font: '16px Tahoma, sans-serif',
        cursor: 'pointer',
      }}
    >
      {t('startMenu.offScreen.safe')}
    </div>
  );
}
