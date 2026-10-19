// One gallery tile: a live mini preview, the name, and a read-only code box with "Copy code!!".
// Copy uses the clipboard; where it is missing or refused, the code is selected instead so the
// player can press Ctrl+C.
import { useId, useRef, useState } from 'react';
import { GLITTERCODEZ_HOST } from '@/content/sites/glittercodez';
import { interpolate } from '@/i18n/t';
import { LayoutPreview } from '../friendspace/LayoutPreview';
import { useSiteText } from '../useSiteText';
import styles from './GlitterCodez.module.css';
import { PREVIEW_THEME, codeFor, type CodeEntry } from './logic';

export function CodeTile({ entry }: { entry: CodeEntry }) {
  const { GLITTERCODEZ_TEXT: T } = useSiteText(GLITTERCODEZ_HOST);
  const id = useId();
  const box = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState<'copied' | 'selected' | null>(null);
  const code = codeFor(entry);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus('copied');
    } catch {
      box.current?.focus();
      box.current?.select();
      setStatus('selected');
    }
  }

  return (
    <article className={styles.tile} aria-label={entry.name}>
      <LayoutPreview
        theme={PREVIEW_THEME}
        extras={entry.extras}
        title={entry.name}
        label={interpolate(T.previewLabel, { name: entry.name })}
      />
      <h3 className={styles.tileName}>{entry.name}</h3>
      {entry.blurb && <p className={styles.blurb}>{entry.blurb}</p>}
      <textarea
        id={id}
        ref={box}
        className={styles.code}
        readOnly
        rows={5}
        spellCheck={false}
        value={code}
        aria-label={interpolate(T.codeLabel, { name: entry.name })}
        onFocus={(e) => e.currentTarget.select()}
      />
      <button type="button" className={styles.copy} onClick={copy}>
        {T.copy}
      </button>
      <p role="status" className={styles.status}>
        {status === 'copied'
          ? T.copied
          : status === 'selected'
            ? T.selected
            : ''}
      </p>
    </article>
  );
}
