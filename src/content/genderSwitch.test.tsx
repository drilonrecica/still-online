// G-02: a gender switch re-renders chats, untouched seeded files and mail in place, like a
// language switch; saves keep references only, and files the player edited keep their text.
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@/apps/registry';
import Mail from '@/apps/mail/Mail';
import {
  MAIL_DEFAULTS,
  cancelPendingReplies,
  useMailStore,
} from '@/apps/mail/store';
import Chat from '@/apps/messenger/chat/Chat';
import { renderTranscript } from '@/apps/messenger/engine';
import { contactContent, line } from '@/apps/messenger/engine/test-helpers';
import {
  getMessengerEngine,
  setMessengerContentsForTests,
} from '@/apps/messenger/runtime';
import { useMessengerStore } from '@/apps/messenger/store';
import { useFsStore } from '@/os/fs/store';
import { seedFilesFor } from '@/os/fs/seeds';
import { systemFolders } from '@/os/fs/nodes';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useToastStore } from '@/os/toast/store';
import type { Gender } from '@/os/types';
import { g } from './gender';
import { getContacts } from './locale';
import type { NeutralTranscriptEntry, Script } from './types';

const setGender = (gender: Gender) =>
  act(() => useSettingsStore.getState().setGender(gender));

afterEach(() => {
  useSettingsStore.setState({ language: 'en', gender: 'girl' });
});

describe('chat', () => {
  const opening: Script = {
    id: 'opening',
    trigger: { type: 'onSignIn' },
    start: 'hi',
    nodes: {
      hi: {
        lines: [line(`ur my fave ${g('cousine', 'cousin')} {name}`, 0)],
        choices: [
          { text: g('aw ur sweet', 'thx dude'), label: 'Thanks', next: 'end' },
          { text: 'brb', label: 'Busy', next: 'end' },
        ],
      },
      end: {
        lines: [
          line('ok', 500, { personalMessageChange: g('glitter', 'skate') }),
        ],
        end: true,
      },
    },
  };

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    useSettingsStore.setState({ playerName: 'Sam', muted: true });
    useMessengerStore.setState(useMessengerStore.getInitialState(), true);
    useWindowsStore.setState({ windows: [], topZ: 0 });
    useToastStore.getState().clear();
    setMessengerContentsForTests([contactContent('lena', [opening])]);
  });

  afterEach(() => {
    setMessengerContentsForTests([]);
    vi.useRealTimers();
  });

  it('re-renders the transcript and personal message without touching the save', async () => {
    await act(async () => {
      getMessengerEngine().signIn();
      await vi.advanceTimersByTimeAsync(3000);
    });
    act(() => getMessengerEngine().choose('lena', 0));
    await act(() => vi.advanceTimersByTimeAsync(5000));
    const stored = useMessengerStore.getState().progress.contacts.lena!;
    expect(JSON.stringify(stored)).not.toMatch(/cousin|sweet|dude|glitter/);

    const windowId = useWindowsStore
      .getState()
      .openApp('messenger-chat', { contactId: 'lena' });
    render(<Chat windowId={windowId} props={{ contactId: 'lena' }} />);
    const chat = screen.getByRole('log', { name: 'Conversation' });
    expect(chat).toHaveTextContent('ur my fave cousine Sam');
    expect(chat).toHaveTextContent('aw ur sweet');
    expect(screen.getByText('glitter')).toBeInTheDocument();

    setGender('boy');
    expect(chat).toHaveTextContent('ur my fave cousin Sam');
    expect(chat).toHaveTextContent('thx dude');
    expect(chat).not.toHaveTextContent('cousine');
    expect(screen.getByText('skate')).toBeInTheDocument();
    const now = useMessengerStore.getState().progress.contacts.lena!;
    expect(now.transcript).toBe(stored.transcript);
    expect(now.personalMessage).toBe(stored.personalMessage);
  });

  it('offers live choices for the current gender', async () => {
    setGender('boy');
    await act(async () => {
      getMessengerEngine().signIn();
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(getMessengerEngine().getChoices('lena')?.[0]?.text).toBe('thx dude');
  });
});

describe("the shipped sample: German Marco's cousin line", () => {
  it.each([
    ['girl', 'siehste. deswegen bist du meine lieblingscousine'],
    ['boy', 'siehste. deswegen bist du mein lieblingscousin'],
  ] as const)('reads for a %s: %s', (gender, text) => {
    const entry: NeutralTranscriptEntry = {
      kind: 'line',
      from: 'contact',
      scriptId: 'followup1',
      nodeId: 'serious',
      lineIndex: 0,
      at: 0,
    };
    const marcoIn = (locale: 'en' | 'de') =>
      getContacts(locale, gender).find((c) => c.contact.id === 'marco');
    const marco = marcoIn('de');
    expect(renderTranscript([entry], marco, 'de', 'Sam', gender)).toEqual([
      { kind: 'message', from: 'contact', text, at: 0 },
    ]);
    // English has no variant here.
    const en = marcoIn('en');
    expect(renderTranscript([entry], en, 'en', 'Sam', gender)[0]).toMatchObject(
      { text: 'see. this is why ur my favorite cousin' },
    );
  });
});

describe('seeded files', () => {
  const ID = 'seed:me-webcam-test';
  const caption = () => useFsStore.getState().nodes[ID]?.photo?.caption;

  beforeEach(() => {
    localStorage.clear();
    useFsStore.setState({ nodes: systemFolders(0), purgedSeeds: [] });
    useFsStore.getState().seed(seedFilesFor('en', 'girl'));
  });

  it('untouched seeds follow the gender, in either language', () => {
    expect(caption()).toBe(
      'testing the new webcam. is my hair always like that',
    );
    setGender('boy');
    expect(caption()).toBe(
      'testing the new webcam. does my hair always stick up like that',
    );
    act(() => useSettingsStore.setState({ language: 'de' }));
    expect(caption()).toBe(
      'teste die neue webcam. stehen meine haare echt immer so ab',
    );
    setGender('girl');
    expect(caption()).toBe(
      'teste die neue webcam. sehen meine haare immer so aus',
    );
  });

  it('a seed the player renamed keeps its text', () => {
    useFsStore.getState().rename(ID, 'me.jpg');
    expect(useFsStore.getState().nodes[ID]?.dirty).toBe(true);
    setGender('boy');
    expect(useFsStore.getState().nodes[ID]?.name).toBe('me.jpg');
    expect(caption()).toBe(
      'testing the new webcam. is my hair always like that',
    );
  });

  it('a saved gender never reaches the persisted records', () => {
    setGender('boy');
    const saved = localStorage.getItem('still-online:v1:fs') ?? '';
    expect(saved).not.toMatch(/stick up|hair always/);
  });
});

describe('mail', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
    useWindowsStore.setState({ windows: [], topZ: 0 });
    useSettingsStore.setState({ connectAutomatically: true, muted: true });
    useMailStore.setState({
      ...MAIL_DEFAULTS,
      messages: [],
      deliveredDays: [],
    });
    useNetworkStore.setState({
      status: 'online',
      kbps: 56,
      phase: 'connected',
      connectedAt: null,
    });
  });

  afterEach(() => {
    cancelPendingReplies();
    useNetworkStore.getState().cancel();
    vi.useRealTimers();
  });

  it("Mom's greeting follows the gender while the mail is open", async () => {
    useMailStore.getState().deliver(1);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const windowId = useWindowsStore.getState().openApp('mail', {});
    render(<Mail windowId={windowId} props={{}} />);
    await user.click(screen.getByText('COMPUTER RULES (please read!!)'));
    expect(screen.getByText(/Hi sweetie,/)).toBeInTheDocument();
    setGender('boy');
    expect(screen.getByText(/Hi buddy,/)).toBeInTheDocument();
    expect(screen.queryByText(/Hi sweetie,/)).toBeNull();
    act(() => useSettingsStore.setState({ language: 'de' }));
    expect(screen.getByText(/Hallo mein Großer,/)).toBeInTheDocument();
    expect(JSON.stringify(useMailStore.getState().messages)).not.toMatch(
      /buddy|sweetie|Großer/,
    );
  });
});
