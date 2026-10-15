// The reply box's "😊 ▾" menu: built-in and custom emoticons to add to the reply, plus
// "Create emoticon…" (a My Pictures file and a `[code]`) and per-emoticon delete.
import { useEffect, useRef, useState } from 'react';
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
    if (picked === null) return setError('Pick a picture first.');
    if (normalized === null)
      return setError(
        'The shortcut must be 2 to 7 characters, with no spaces or brackets.',
      );
    if (!add(normalized, picked))
      return setError(`The shortcut ${normalized} is already in use.`);
    onClose();
  }

  return (
    <Dialog title="Create emoticon" onSubmit={submit} onCancel={onClose}>
      <ul
        className={messengerStyles.pictureList}
        role="listbox"
        aria-label="My Pictures"
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
      {images.length === 0 && <p>There are no pictures in My Pictures.</p>}
      <label>
        Shortcut (like [ponies]){' '}
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
        aria-label="Emoticons"
        onClick={() => setOpen(!open)}
      >
        😊 ▾
      </button>
      {open && (
        <div className={styles.emoMenu} role="menu" aria-label="Emoticons">
          {EMOTICONS.map((e) => (
            <button
              key={e.name}
              type="button"
              role="menuitem"
              className={styles.emoItem}
              onClick={() => {
                setOpen(false);
                onPick(e.codes[0] ?? e.name);
              }}
            >
              <img src={e.src} alt="" width={19} height={19} />
              {e.name} {e.codes[0] ?? ''}
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
                aria-label={`Delete ${e.code}`}
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
            Create emoticon…
          </button>
        </div>
      )}
      {creating && <CreateDialog onClose={() => setCreating(false)} />}
    </div>
  );
}
