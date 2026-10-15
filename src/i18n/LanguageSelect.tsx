// A native <select> of the supported languages, shown by their own names ("English", "Deutsch").
import { LOCALES, LOCALE_NAMES, type Locale } from './types';

export interface LanguageSelectProps {
  id?: string;
  value: Locale;
  onChange: (locale: Locale) => void;
  className?: string;
  'aria-label'?: string;
}

export function LanguageSelect({
  value,
  onChange,
  ...rest
}: LanguageSelectProps) {
  return (
    <select
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value as Locale)}
    >
      {LOCALES.map((l) => (
        <option key={l} value={l} lang={l}>
          {LOCALE_NAMES[l]}
        </option>
      ))}
    </select>
  );
}
