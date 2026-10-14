// Black "safe to turn off" screen shown in the `off` session state.
import { useSessionStore } from '@/os/store/session';

export function OffScreen() {
  const powerOn = useSessionStore((s) => s.powerOn);
  return (
    <div
      data-testid="off-screen"
      role="button"
      tabIndex={0}
      aria-label="Power on"
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
      It is now safe to turn off your computer.
    </div>
  );
}
