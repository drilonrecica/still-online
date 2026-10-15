// The tray's sheep head: lets Fluff out onto the desktop, or sends Fluff home.
import { useSettingsStore } from '@/os/store/settings';

export function PetTray({ className }: { className?: string }) {
  const enabled = useSettingsStore((s) => s.petEnabled);
  const setPetEnabled = useSettingsStore((s) => s.setPetEnabled);
  return (
    <button
      type="button"
      className={className}
      aria-label="Desktop sheep"
      aria-pressed={enabled}
      title={enabled ? 'Send Fluff home' : 'Meet Fluff'}
      data-pet-tray
      onClick={() => setPetEnabled(!enabled)}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <ellipse
          cx="3"
          cy="7"
          rx="2.4"
          ry="1.2"
          fill="#3a312a"
          transform="rotate(-20 3 7)"
        />
        <ellipse
          cx="13"
          cy="7"
          rx="2.4"
          ry="1.2"
          fill="#3a312a"
          transform="rotate(20 13 7)"
        />
        <ellipse cx="8" cy="9.5" rx="4" ry="5" fill="#4b4038" />
        <circle cx="6" cy="4.5" r="2.2" fill="#fbf9f2" />
        <circle cx="10" cy="4.5" r="2.2" fill="#fbf9f2" />
        <circle cx="8" cy="3.4" r="2.2" fill="#fbf9f2" />
        <circle cx="6.4" cy="8.6" r="1" fill="#fff" />
        <circle cx="9.6" cy="8.6" r="1" fill="#fff" />
        <circle cx="6.6" cy="8.8" r="0.5" fill="#111" />
        <circle cx="9.4" cy="8.8" r="0.5" fill="#111" />
        <path
          d="M7 12.6q1 .7 2 0"
          stroke="#d79a95"
          strokeWidth="0.8"
          fill="none"
        />
      </svg>
    </button>
  );
}
