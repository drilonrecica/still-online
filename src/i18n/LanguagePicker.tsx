// The login screen's language choice: one big flag button per language, as a radio group.
// Switches live, like the tray badge and Regional and Language Options.
import { LanguageFlag } from './LanguageFlag';
import { LOCALES, LOCALE_NAMES, type Locale } from './types';

export interface LanguagePickerProps {
  value: Locale;
  onChange: (locale: Locale) => void;
  label: string;
  className?: string;
  optionClassName?: string;
}

export function LanguagePicker({
  value,
  onChange,
  label,
  className,
  optionClassName,
}: LanguagePickerProps) {
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
        const next =
          LOCALES[
            (LOCALES.indexOf(value) + step + LOCALES.length) % LOCALES.length
          ]!;
        onChange(next);
        e.currentTarget.querySelector<HTMLElement>(`[lang="${next}"]`)?.focus();
      }}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={l === value}
          tabIndex={l === value ? 0 : -1}
          lang={l}
          className={optionClassName}
          onClick={() => onChange(l)}
        >
          <LanguageFlag locale={l} size={20} />
          {LOCALE_NAMES[l]}
        </button>
      ))}
    </div>
  );
}
