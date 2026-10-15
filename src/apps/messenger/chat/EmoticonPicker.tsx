// The reply box's "😊 ▾" menu: built-in and custom emoticons to add to the reply, plus
// "Create emoticon…" (a My Pictures file and a `[code]`) and per-emoticon delete.
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { Dialog } from '../AwayDialogs';
import { normalizeCustomCode } from '../customEmoticons';
import messengerStyles from '../Messenger.module.css';
import { useMessengerStore } from '../store';
import styles from './Chat.module.css';
import { EMOTICONS } from './emoticons';
import { PictureFile } from './PlayerPicture';

function CreateDialog({ onClose }: { onClose: () => void }) {
  const t = useT();
  const nodes = useFsStore((s) => s.nodes);
  const add = useMessengerStore((s) => s.addCustomEmoticon);
  const images = useFsStore
    .getState()
    .list(FS_FOLDERS.pics)
    .filter((n) => n.type === 'image' && nodes[n.id]);
  const [picked, setPicked] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const normalized = normalizeCustomCode(code);
    if (picked === null) return setError(t('messenger.emoticons.pickPicture'));
    if (normalized === null)
      return setError(t('messenger.emoticons.badShortcut'));
    if (!add(normalized, picked))
      return setError(
        t('messenger.emoticons.shortcutInUse', { code: normalized }),
      );
    onClose();
  }

  return (
    <Dialog
      title={t('messenger.emoticons.createTitle')}
      onSubmit={submit}
      onCancel={onClose}
    >
      <ul
        className={messengerStyles.pictureList}
        role="listbox"
        aria-label={t('messenger.dialogs.myPictures')}
      >
        {images.map((n) => (
          <li key={n.id} role="none">
            <button
              type="button"
              role="option"
              aria-selected={picked === n.id}
              className={messengerStyles.pictureOption}
              onClick={() => setPicked(n.id)}
            >
              <PictureFile fileId={n.id} size={40} label="" />
              {n.name}
            </button>
          </li>
        ))}
      </ul>
      {images.length === 0 && <p>{t('messenger.emoticons.noPictures')}</p>}
      <label>
        {t('messenger.emoticons.shortcut')}{' '}
        <input
          value={code}
          maxLength={9}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
        />
      </label>
      {error && <p role="alert">{error}</p>}
    </Dialog>
  );
}

export function EmoticonPicker({
  disabled,
  onPick,
}: {
  disabled: boolean;
  /** Called with the code to add to the reply. */
  onPick: (code: string) => void;
}) {
  const t = useT();
  const custom =
    useMessengerStore((s) => s.progress.player.customEmoticons) ?? [];
  const remove = useMessengerStore((s) => s.removeCustomEmoticon);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <div
      ref={wrap}
      className={styles.emoWrap}
      onKeyDown={(e) => {
        if (e.key !== 'Escape' || !open) return;
        e.stopPropagation();
        setOpen(false);
        button.current?.focus();
      }}
    >
      <button
        ref={button}
        type="button"
        className={styles.tool}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('messenger.emoticons.menu')}
        onClick={() => setOpen(!open)}
      >
        😊 ▾
      </button>
      {open && (
        <div
          className={styles.emoMenu}
          role="menu"
          aria-label={t('messenger.emoticons.menu')}
        >
          {EMOTICONS.map((e) => (
            <button
              key={e.codes[0]}
              type="button"
              role="menuitem"
              className={styles.emoItem}
              onClick={() => {
                setOpen(false);
                onPick(e.codes[0] ?? '');
              }}
            >
              <img src={e.src} alt="" width={19} height={19} />
              {e.nameKey ? t(e.nameKey) : e.codes[0]} {e.codes[0] ?? ''}
            </button>
          ))}
          {custom.map((e) => (
            <div key={e.code} className={styles.emoRow}>
              <button
                type="button"
                role="menuitem"
                className={styles.emoItem}
                onClick={() => {
                  setOpen(false);
                  onPick(e.code);
                }}
              >
                <PictureFile fileId={e.fileId} size={19} label="" />
                {e.code}
              </button>
              <button
                type="button"
                aria-label={t('messenger.emoticons.delete', { code: e.code })}
                onClick={() => remove(e.code)}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            role="menuitem"
            className={styles.emoItem}
            onClick={() => {
              setOpen(false);
              setCreating(true);
            }}
          >
            {t('messenger.emoticons.create')}
          </button>
        </div>
      )}
      {creating && <CreateDialog onClose={() => setCreating(false)} />}
    </div>
  );
}
