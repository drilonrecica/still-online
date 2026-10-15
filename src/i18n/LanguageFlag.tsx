// The flag shown next to a language's name in the pickers: the UK flag for English, the German
// flag for Deutsch. Decorative: the language name is always written beside it.
import flagDe from '@/assets/icons/flag-de.svg';
import flagGb from '@/assets/icons/flag-gb.svg';
import type { Locale } from './types';

const FLAGS: Readonly<Record<Locale, string>> = { en: flagGb, de: flagDe };

export function LanguageFlag({
  locale,
  size = 16,
  className,
}: {
  locale: Locale;
  /** Height in px; flags are drawn 3:2. */
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={FLAGS[locale]}
      alt=""
      width={Math.round((size * 3) / 2)}
      height={size}
      className={className}
      data-flag={locale}
    />
  );
}
