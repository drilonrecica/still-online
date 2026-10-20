// P0-05: Messenger stores references and renders them at view time in the current locale.
import { act, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@/apps/registry';
import { contacts } from '@/content/contacts';
import type {
  ContactContent,
  NeutralTranscriptEntry,
  Script,
} from '@/content/types';
import { useSettingsStore } from '@/os/store/settings';
import { toastText, useToastStore } from '@/os/toast/store';
import { ToastLayer } from '@/os/toast/ToastLayer';
import { useWindowsStore } from '@/os/store/windows';
import Chat from './chat/Chat';
import { renderTranscript } from './engine';
import { contactContent, line } from './engine/test-helpers';
import History from './history/History';
import Messenger from './Messenger';
import { getMessengerEngine, setMessengerContentsForTests } from './runtime';
import { useMessengerStore } from './store';
import { shownPersonalMessage, shownTexts } from './testing';
import v02 from '@/test/fixtures/v02-messenger.json';

const opening: Script = {
  id: 'opening',
  trigger: { type: 'onSignIn' },
  start: 'hi',
  nodes: {
    hi: {
      lines: [line('heyyy {name} :)', 0)],
      choices: [
        { text: 'hey lena!! whats up', label: 'Hey!', next: 'up' },
        { text: 'cant talk, brb', label: 'Busy', next: 'bye' },
      ],
    },
    up: {
      lines: [
        line('nm, u?', 500, { personalMessageChange: 'chillin w/ {name}' }),
      ],
      end: true,
    },
    bye: { lines: [line('ok :(', 500)], end: true },
  },
};

const lena = contactContent('lena', [opening], { displayName: 'Lena' });

/** Stand-in for a P2 overlay: the same structure, one line, one choice and the pm changed. */
const lenaDe: ContactContent = {
  ...lena,
  scripts: [
    {
      ...opening,
      nodes: {
        ...opening.nodes,
        hi: {
          lines: opening.nodes.hi!.lines,
          choices: [
            { text: 'hey lena!! was geht', label: 'Hey!', next: 'up' },
            { text: 'kann grad nich, bg', label: 'Busy', next: 'bye' },
          ],
        },
        up: {
          lines: [
            line('nix, und du?', 500, {
              personalMessageChange: 'chill mit {name}',
            }),
          ],
          end: true,
        },
      },
    },
  ],
};

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  useSettingsStore.setState({ playerName: 'Drilon', muted: true });
  useMessengerStore.setState(useMessengerStore.getInitialState(), true);
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useToastStore.getState().clear();
  setMessengerContentsForTests([lena], { de: [lenaDe] });
});

afterEach(() => {
  setMessengerContentsForTests([]);
  vi.useRealTimers();
});

async function playToEnd() {
  await act(async () => {
    getMessengerEngine().signIn();
    await vi.advanceTimersByTimeAsync(3000);
  });
  act(() => {
    getMessengerEngine().choose('lena', 0);
  });
  await act(() => vi.advanceTimersByTimeAsync(5000));
}

const setLanguage = (l: 'en' | 'de') =>
  act(() => useSettingsStore.getState().setLanguage(l));

describe('live language switch', () => {
  it('re-renders a finished conversation from the overlay: chat, history and contact list', async () => {
    await playToEnd();
    const stored = useMessengerStore.getState().progress.contacts.lena!;
    expect(JSON.stringify(stored)).not.toMatch(/heyyy|nm, u|chillin|Drilon/);

    const windowId = useWindowsStore
      .getState()
      .openApp('messenger-chat', { contactId: 'lena' });
    render(
      <>
        <Chat windowId={windowId} props={{ contactId: 'lena' }} />
        <History windowId="h" props={{ contactId: 'lena' }} />
        <Messenger />
      </>,
    );
    const chat = screen.getByRole('log', { name: 'Conversation' });
    const history = screen.getByRole('log', { name: 'History' });
    for (const log of [chat, history]) {
      expect(log).toHaveTextContent('heyyy Drilon');
      expect(log).toHaveTextContent('hey lena!! whats up');
      expect(log).toHaveTextContent('nm, u?');
    }
    expect(screen.getAllByText('chillin w/ Drilon').length).toBe(2);

    setLanguage('de');
    for (const log of [chat, history]) {
      expect(log).toHaveTextContent('heyyy Drilon');
      expect(log).toHaveTextContent('hey lena!! was geht');
      expect(log).toHaveTextContent('nix, und du?');
      expect(log).not.toHaveTextContent('nm, u?');
    }
    // Chat header and contact list.
    expect(screen.getAllByText('chill mit Drilon').length).toBe(2);
    expect(screen.queryByText('chillin w/ Drilon')).toBeNull();

    // The saved state did not change; switching back renders English again.
    const now = useMessengerStore.getState().progress.contacts.lena!;
    expect(now.transcript).toBe(stored.transcript);
    expect(now.personalMessage).toBe(stored.personalMessage);
    setLanguage('en');
    expect(chat).toHaveTextContent('nm, u?');
  });

  it('{name} follows the player name at render time', async () => {
    await playToEnd();
    act(() => useSettingsStore.setState({ playerName: 'Alex' }));
    expect(shownTexts('lena')[0]).toBe('heyyy Alex :)');
    expect(shownPersonalMessage('lena')).toBe('chillin w/ Alex');
  });

  it('renders choices and toasts in the current locale', async () => {
    setLanguage('de');
    await act(async () => {
      getMessengerEngine().signIn();
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(
      getMessengerEngine()
        .getChoices('lena')
        ?.map((c) => c.text),
    ).toEqual(['hey lena!! was geht', 'kann grad nich, bg']);
    act(() => {
      getMessengerEngine().choose('lena', 0);
    });
    await act(() => vi.advanceTimersByTimeAsync(5000));
    const texts = useToastStore
      .getState()
      .toasts.map((t) => t.text && toastText(t.text));
    expect(texts).toContain('nix, und du?');
  });

  it('re-renders a toast that is up during a language switch', async () => {
    render(<ToastLayer />);
    await act(async () => {
      getMessengerEngine().signIn();
      await vi.advanceTimersByTimeAsync(3000);
    });
    act(() => {
      getMessengerEngine().choose('lena', 0);
    });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(screen.getAllByText('Lena says:').length).toBeGreaterThan(0);
    expect(screen.getByText('nm, u?')).toBeTruthy();
    setLanguage('de');
    expect(screen.queryByText('Lena says:')).toBeNull();
    expect(screen.getAllByText('Lena sagt:').length).toBeGreaterThan(0);
    expect(screen.getByText('nix, und du?')).toBeTruthy();
    expect(screen.queryByText('nm, u?')).toBeNull();
  });
});

describe('v0.2 saves', () => {
  const jessV02 = v02.state.progress.contacts.jess;
  const legacyTexts = jessV02.transcript.flatMap((e) =>
    'text' in e ? [e.text] : [],
  );

  beforeEach(async () => {
    setMessengerContentsForTests(contacts);
    localStorage.setItem('still-online:v1:messenger', JSON.stringify(v02));
    await useMessengerStore.persist.rehydrate();
  });

  it('keeps every transcript entry and renders the text verbatim in both languages', () => {
    const p = useMessengerStore.getState().progress;
    for (const [id, c] of Object.entries(v02.state.progress.contacts))
      expect(p.contacts[id]?.transcript).toHaveLength(c.transcript.length);
    expect(shownTexts('jess')).toEqual(legacyTexts);
    setLanguage('de');
    expect(shownTexts('jess')).toEqual(legacyTexts);
  });

  it('shows old personal messages as written and the old away message as the default', () => {
    expect(useMessengerStore.getState().progress.contacts.jess).toMatchObject({
      personalMessage: { kind: 'literal', text: jessV02.personalMessage },
    });
    expect(shownPersonalMessage('jess')).toBe(jessV02.personalMessage);
    expect(useMessengerStore.getState().progress.player.awayMessage).toBeNull();
  });

  it('renders the old conversation in the chat window', () => {
    const windowId = useWindowsStore
      .getState()
      .openApp('messenger-chat', { contactId: 'jess' });
    render(<Chat windowId={windowId} props={{ contactId: 'jess' }} />);
    const log = screen.getByRole('log', { name: 'Conversation' });
    const lines = within(log).getAllByText(
      (_, el) => el?.getAttribute('class')?.includes('line') ?? false,
    );
    expect(lines.length).toBeGreaterThan(0);
    expect(log).toHaveTextContent(legacyTexts[0]!);
    expect(log).toHaveTextContent(legacyTexts.at(-1)!);
  });
});

describe('render performance', () => {
  it('renders a 500-entry transcript quickly and memoizes per entry and locale', () => {
    const entries: NeutralTranscriptEntry[] = Array.from(
      { length: 500 },
      (_, i) =>
        i % 2 === 0
          ? {
              kind: 'line',
              from: 'contact',
              scriptId: 'opening',
              nodeId: 'hi',
              lineIndex: 0,
              at: i,
            }
          : {
              kind: 'choice',
              from: 'player',
              scriptId: 'opening',
              nodeId: 'hi',
              choiceIndex: 0,
              flavor: ':)',
              at: i,
            },
    );
    const started = performance.now();
    const en = renderTranscript(entries, lena, 'en', 'Drilon', 'girl');
    expect(performance.now() - started).toBeLessThan(100);
    expect(en).toHaveLength(500);
    expect(en[1]).toMatchObject({ text: 'hey lena!! whats up :)' });

    const again = renderTranscript(entries, lena, 'en', 'Drilon', 'girl');
    expect(again.every((e, i) => e === en[i])).toBe(true);
    const de = renderTranscript(entries, lenaDe, 'de', 'Drilon', 'girl');
    expect(de[1]).toMatchObject({ text: 'hey lena!! was geht :)' });
    expect(de[1]).not.toBe(en[1]);
  });
});
