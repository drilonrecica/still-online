// "I am a: Girl / Boy" as a radio group of two big buttons, like the login screen's language
// flags. Used by Login and User Accounts. With no choice yet, Girl is the one tab stop.
import girlIcon from '@/assets/user/gender-girl.svg';
import boyIcon from '@/assets/user/gender-boy.svg';
import { useT } from '@/i18n/useT';
import type { Gender } from '@/os/types';

const OPTIONS = [
  { id: 'girl', icon: girlIcon, labelKey: 'login.genderGirl' },
  { id: 'boy', icon: boyIcon, labelKey: 'login.genderBoy' },
] as const satisfies readonly { id: Gender; icon: string; labelKey: string }[];

export interface GenderPickerProps {
  value: Gender | null;
  onChange: (gender: Gender) => void;
  label: string;
  className?: string;
  optionClassName?: string;
}

export function GenderPicker({
  value,
  onChange,
  label,
  className,
  optionClassName,
}: GenderPickerProps) {
  const t = useT();
  const focusIndex = Math.max(
    0,
    OPTIONS.findIndex((o) => o.id === value),
  );
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={className}
      onKeyDown={(e) => {
        if (
          !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
        )
          return;
        e.preventDefault();
        const step = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
        // From no choice, the first arrow press picks the option it points at.
        const from = value === null ? (step > 0 ? -1 : 0) : focusIndex;
        const next =
          OPTIONS[(from + step + OPTIONS.length) % OPTIONS.length]!.id;
        onChange(next);
        e.currentTarget
          .querySelector<HTMLElement>(`[data-gender="${next}"]`)
          ?.focus();
      }}
    >
      {OPTIONS.map((o, i) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          tabIndex={i === focusIndex ? 0 : -1}
          data-gender={o.id}
          className={optionClassName}
          onClick={() => onChange(o.id)}
        >
          <img src={o.icon} alt="" width={20} height={20} />
          {t(o.labelKey)}
        </button>
      ))}
    </div>
  );
}
