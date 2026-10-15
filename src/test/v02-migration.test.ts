// Loading a v0.2 save (src/test/fixtures/v02-save.json, written by the v0.2 code) migrates every
// store to its language-neutral shape without losing anything the player made, and the new saved
// shape holds no generated English. See docs/i18n.md → "Persisted state".
import { beforeEach, describe, expect, it } from 'vitest';
import '@/apps/registry';
import { renderFavorites, useWebStore } from '@/apps/browser/store';
import { renderMail, renderMails } from '@/apps/mail/records';
import { playerAddress, useMailStore } from '@/apps/mail/store';
import type { MailMessage } from '@/content/mail/types';
import { getPlayerName, screensaverText } from '@/i18n/settingsText';
import { getLocale } from '@/i18n/t';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { titleOf } from './windowTitle';
import save from './fixtures/v02-save.json';

type StoreName = 'settings' | 'windows' | 'fs' | 'mail' | 'web';

const saved = (name: StoreName): string =>
  localStorage.getItem(`still-online:v1:${name}`) ?? '';

/** Writes the fixture (optionally patched) and rehydrates every store, settings first. */
async function loadV02(patch?: (s: typeof save) => void) {
  const data = structuredClone(save);
  patch?.(data);
  localStorage.clear();
  for (const name of ['settings', 'windows', 'fs', 'mail', 'web'] as const) {
    localStorage.setItem(`still-online:v1:${name}`, JSON.stringify(data[name]));
  }
  await useSettingsStore.persist.rehydrate();
  await Promise.all([
    useWindowsStore.persist.rehydrate(),
    useFsStore.persist.rehydrate(),
    useMailStore.persist.rehydrate(),
    useWebStore.persist.rehydrate(),
  ]);
}

/** Forces every store to write its current state. */
function resave() {
  useSettingsStore.setState({});
  useWindowsStore.setState({});
  useFsStore.setState({});
  useMailStore.setState({});
  useWebStore.setState({});
}

const v02Mail = save.mail.state.messages;
const v02Nodes = Object.values(save.fs.state.nodes);

beforeEach(() => loadV02());

describe('v0.2 settings', () => {
  it('turns the English defaults into localized defaults and keeps the rest', () => {
    const s = useSettingsStore.getState();
    expect(s).toMatchObject({
      playerName: null,
      awayMessage: null,
      screensaver: { id: 'marquee', minutes: 7, text: null },
      firstBootDone: true,
      language: null,
    });
    expect(getLocale()).toBe('en');
    expect(getPlayerName()).toBe('Player');
    useSettingsStore.getState().setLanguage('de');
    expect(getPlayerName()).toBe('Spieler');
    expect(screensaverText(useSettingsStore.getState().screensaver)).toBe(
      'still online...',
    );
  });

  it('keeps what the player typed', async () => {
    await loadV02((d) => {
      d.settings.state.playerName = 'Alex';
      d.settings.state.awayMessage = 'at practice';
      d.settings.state.screensaver.text = 'ALEX RULEZ';
    });
    expect(useSettingsStore.getState()).toMatchObject({
      playerName: 'Alex',
      awayMessage: 'at practice',
      screensaver: { text: 'ALEX RULEZ' },
    });
  });
});

describe('v0.2 windows', () => {
  it('restores every window and drops the rendered titles', () => {
    const { windows } = useWindowsStore.getState();
    expect(windows.map((w) => [w.id, w.appId, w.props])).toEqual(
      save.windows.state.windows.map((w) => [w.id, w.appId, w.props]),
    );
    for (const w of windows) expect(w).not.toHaveProperty('title');
    // Until the app mounts and sets its title again, the registry title shows.
    expect(titleOf('win-1')).toBe('Untitled - Notepad');
    useSettingsStore.getState().setLanguage('de');
    expect(titleOf('win-3')).toBe('Unterhaltung');
  });
});

describe('v0.2 file system', () => {
  it('keeps every node, the player files and every edit', () => {
    const { nodes } = useFsStore.getState();
    expect(Object.keys(nodes).sort()).toEqual(v02Nodes.map((n) => n.id).sort());
    const byName = (name: string) =>
      Object.values(nodes).find((n) => n.name === name);
    expect(byName('mine.txt')).toMatchObject({ text: 'player text' });
    expect(byName('New Folder')).toMatchObject({ parentId: FS_FOLDERS.pics });
    // Renamed and edited seeds are frozen as the player left them.
    expect(byName('my renamed.txt')).toMatchObject({ dirty: true });
    const edited = Object.values(nodes).find((n) => n.text === 'edited by me');
    expect(edited).toMatchObject({ dirty: true });
    expect(edited?.id.startsWith('seed:')).toBe(true);
    // Deleted seeds stay in the Recycle Bin, untouched (moving isn't editing).
    const binned = Object.values(nodes).filter(
      (n) => n.parentId === FS_FOLDERS.recycle,
    );
    expect(binned.length).toBe(
      v02Nodes.filter((n) => n.parentId === FS_FOLDERS.recycle).length,
    );
    expect(binned.every((n) => n.deletedFrom && !n.dirty)).toBe(true);
    // Untouched seeds read exactly as before.
    for (const old of v02Nodes) {
      const node = nodes[old.id];
      expect(node?.name, old.id).toBe(old.name);
      expect(node?.text, old.id).toBe('text' in old ? old.text : undefined);
    }
  });

  it('saves no system folder names and no text of untouched seeds', () => {
    resave();
    const records = JSON.parse(saved('fs')).state.nodes as Record<
      string,
      Record<string, unknown>
    >;
    expect(records.docs).not.toHaveProperty('name');
    const clean = Object.values(records).filter(
      (r) => String(r.id).startsWith('seed:') && !r.dirty,
    );
    expect(clean.length).toBeGreaterThan(10);
    for (const r of clean) {
      expect(r).not.toHaveProperty('name');
      expect(r).not.toHaveProperty('text');
      expect((r.photo as { caption?: string } | undefined)?.caption).toBe(
        undefined,
      );
    }
    expect(saved('fs')).not.toContain('My Documents');
    expect(saved('fs')).toContain('my renamed.txt');
    expect(saved('fs')).toContain('player text');
  });

  it('renames the system folders live on a language switch', () => {
    useSettingsStore.getState().setLanguage('de');
    const fs = useFsStore.getState();
    expect(fs.get(FS_FOLDERS.docs)?.name).toBe('Eigene Dateien');
    expect(fs.path(FS_FOLDERS.pics)).toBe('Eigene Dateien\\Eigene Bilder');
    // A file the player renamed keeps its name.
    expect(
      fs.list(FS_FOLDERS.docs).some((n) => n.name === 'my renamed.txt'),
    ).toBe(true);
  });
});

describe('v0.2 mail', () => {
  const rendered = (): MailMessage[] =>
    renderMails(useMailStore.getState().messages, 'en', playerAddress());

  it('migrates by kind and renders exactly the old mail in English', () => {
    const records = useMailStore.getState().messages;
    const kinds = records.map((r) => r.kind);
    expect(kinds.filter((k) => k === 'content')).toHaveLength(9);
    expect(kinds.filter((k) => k === 'bounce')).toHaveLength(2);
    expect(kinds.filter((k) => k === 'autoReply')).toHaveLength(2);
    expect(kinds.filter((k) => k === 'text')).toHaveLength(4);
    expect(rendered()).toEqual(
      v02Mail.map((m) => ({ ...m, attachments: m.attachments ?? [] })),
    );
    expect(useMailStore.getState().deliveredDays).toEqual(
      save.mail.state.deliveredDays,
    );
  });

  it('saves no generated English', () => {
    resave();
    const json = saved('mail');
    for (const text of [
      'Mail Delivery Subsystem',
      'Undeliverable',
      'could not be delivered',
      '(no subject)',
      'i read ur email 2 times',
      'Player',
      v02Mail[0]!.subject,
    ]) {
      expect(json).not.toContain(text);
    }
    // What the player wrote is kept verbatim.
    expect(json).toContain('hello?');
    expect(json).toContain('party');
  });

  it('renders generated mail in German after a switch', () => {
    const bounce = useMailStore
      .getState()
      .messages.find((r) => r.kind === 'bounce' && r.params.subject === '');
    const de = bounce && renderMail(bounce, 'de', playerAddress('Spieler'));
    expect(de).toMatchObject({
      from: { name: 'E-Mail-Zustellsystem' },
      subject: 'Unzustellbar: (kein Betreff)',
    });
    expect(de?.body).toContain('nobody@nowhere.example');
    const again = useMailStore
      .getState()
      .messages.find((r) => r.kind === 'autoReply' && r.again);
    expect(again && renderMail(again, 'de', playerAddress())?.subject).toBe(
      'AW: again',
    );
  });
});

describe('v0.2 web', () => {
  it('keeps every favorite and names the untouched defaults per language', () => {
    const { favorites, counters } = useWebStore.getState();
    expect(favorites.map((f) => f.url)).toEqual(
      save.web.state.favorites.map((f) => f.url),
    );
    expect(renderFavorites(favorites, 'en')).toEqual(save.web.state.favorites);
    expect(renderFavorites(favorites, 'de').map((f) => f.title)).toContain(
      'Westfield-Gymnasium',
    );
    expect(counters).toEqual(save.web.state.counters);
    resave();
    expect(saved('web')).not.toContain('Westfield High');
    expect(saved('web')).toContain('My Spaceport');
  });
});
