import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsStore } from '@/os/store/settings';
import { buildContactList } from './contactList';
import { contactContent, line } from './engine/test-helpers';
import Messenger, { handleFor, SIGN_IN_MS } from './Messenger';
import { getMessengerEngine, setMessengerContentsForTests } from './runtime';
import { useMessengerStore } from './store';
import { Taskbar } from '@/os/taskbar/Taskbar';
import { useWindowsStore } from '@/os/store/windows';
import { useNowPlayingStore } from '@/os/nowPlaying';
import { useAttentionStore } from '@/os/store/attention';
import { createAmplifierStore } from '@/apps/amplifier/store';
import '@/apps/registry';

const contents = [
  contactContent('ann', [], { displayName: 'Ann', signInAfterMs: 0 }),
  contactContent('bob', [], {
    displayName: 'Bob',
    signInAfterMs: 0,
    initialStatus: 'away',
  }),
  contactContent('cat', [], { displayName: 'Cat', signInAfterMs: 60_000 }),
  contactContent('sam', [], {
    displayName: 'Sam',
    group: 'School',
    signInAfterMs: 120_000,
  }),
  contactContent('mum', [], {
    displayName: 'Mum',
    group: 'Family',
    initialStatus: 'offline',
    signInAfterMs: 0,
  }),
];

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  useSettingsStore.setState({ playerName: 'Drilon', muted: true });
  useMessengerStore.setState(useMessengerStore.getInitialState(), true);
  useAttentionStore.setState({ keys: {} });
  setMessengerContentsForTests(contents);
});

afterEach(() => {
  setMessengerContentsForTests([]);
  vi.useRealTimers();
});

async function signIn() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Messenger />);
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
  await act(() => vi.advanceTimersByTimeAsync(SIGN_IN_MS));
  return user;
}

describe('sign-in', () => {
  it('prefills the handle from the player name', () => {
    expect(handleFor('Dri Lon!')).toBe('dri.lon@livemail.example');
    expect(handleFor('???')).toBe('player@livemail.example');
    render(<Messenger />);
    expect(screen.getByLabelText('E-mail address:')).toHaveValue(
      'drilon@livemail.example',
    );
  });

  it('spins for ~2s, then shows the contact list and signs the engine in', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Messenger />);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(useMessengerStore.getState().signedIn).toBe(false);

    await act(() => vi.advanceTimersByTimeAsync(SIGN_IN_MS - 100));
    expect(useMessengerStore.getState().signedIn).toBe(false);
    await act(() => vi.advanceTimersByTimeAsync(100));

    expect(useMessengerStore.getState().signedIn).toBe(true);
    expect(screen.getByLabelText('Contacts')).toBeTruthy();
    expect(screen.getByText('Drilon')).toBeTruthy();
  });

  it('signing out returns to the sign-in view', async () => {
    const user = await signIn();
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
    expect(useMessengerStore.getState().signedIn).toBe(false);
  });
});

describe('contact list', () => {
  it('groups contacts with online/total counts and an Offline group', async () => {
    await signIn();
    expect(
      screen.getByRole('button', { name: /Friends \(2\/3\)/ }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /School \(0\/1\)/ }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: /Offline \(3\)/ })).toBeTruthy();

    const friends = screen.getByRole('group', { name: 'Friends' });
    expect(within(friends).getByText('Ann')).toBeTruthy();
    expect(within(friends).getByText('Bob')).toBeTruthy();
    expect(within(friends).queryByText('Cat')).toBeNull();
    const offline = screen.getByRole('group', { name: 'Offline' });
    for (const name of ['Cat', 'Sam', 'Mum'])
      expect(within(offline).getByText(name)).toBeTruthy();
  });

  it('collapses and expands a group', async () => {
    const user = await signIn();
    const header = screen.getByRole('button', { name: /Friends/ });
    await user.click(header);
    expect(screen.queryByText('Ann')).toBeNull();
    await user.click(header);
    expect(screen.getByText('Ann')).toBeTruthy();
  });

  it('reflects status changes and late sign-ins live', async () => {
    await signIn();
    act(() => {
      const { progress } = useMessengerStore.getState();
      const ann = progress.contacts.ann!;
      useMessengerStore.setState({
        progress: {
          ...progress,
          contacts: {
            ...progress.contacts,
            ann: { ...ann, status: 'busy', personalMessage: 'studying!!' },
          },
        },
      });
    });
    const ann = screen.getByText('Ann').closest('[data-contact-id]')!;
    expect(ann.getAttribute('data-status')).toBe('busy');
    expect(ann).toHaveTextContent('- studying!!');

    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(
      screen.getByRole('button', { name: /Friends \(3\/3\)/ }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: /Offline \(2\)/ })).toBeTruthy();
  });

  /** Ann asks a question on sign-in and waits for the player's reply. */
  const askingAnn = () => [
    contactContent(
      'ann',
      [
        {
          id: 'ask',
          trigger: { type: 'onSignIn' } as const,
          start: 'q',
          nodes: {
            q: {
              lines: [line('u there?', 0)],
              choices: [
                { text: 'yep', next: 'done' },
                { text: 'nope', next: 'done' },
              ] as const,
            },
            done: { lines: [line('ok', 0)], end: true as const },
          },
        },
      ],
      { displayName: 'Ann', signInAfterMs: 0 },
    ),
  ];

  async function signInWithAnnWaiting() {
    setMessengerContentsForTests(askingAnn());
    const user = await signIn();
    await act(() => vi.advanceTimersByTimeAsync(10_000));
    return user;
  }

  async function reply() {
    act(() => {
      getMessengerEngine().choose('ann', 0);
    });
    await act(() => vi.advanceTimersByTimeAsync(10_000));
  }

  it('marks contacts waiting for a reply until the player answers', async () => {
    await signInWithAnnWaiting();
    const ann = screen.getByText('Ann').closest('[data-contact-id]')!;
    expect(ann.getAttribute('data-awaiting-reply')).toBe('true');
    expect(
      within(ann as HTMLElement).getByLabelText('Waiting for your reply'),
    ).toBeTruthy();

    await reply();
    expect(ann.getAttribute('data-awaiting-reply')).toBe('false');
    expect(
      within(ann as HTMLElement).queryByLabelText('Waiting for your reply'),
    ).toBeNull();
  });

  it('counts waiting contacts in the footer', async () => {
    await signInWithAnnWaiting();
    expect(screen.getByText('1 contacts · 1 waiting')).toBeTruthy();
    await reply();
    expect(screen.getByText('1 contacts')).toBeTruthy();
  });

  it('asks for attention: Messenger while no chat shows it, else that chat', async () => {
    useWindowsStore.setState({ windows: [], topZ: 0 });
    await signInWithAnnWaiting();
    const keys = () => useAttentionStore.getState().keys;
    expect(keys()).toEqual({ messenger: true, 'messenger-chat:ann': true });

    act(() => {
      useWindowsStore
        .getState()
        .openApp('messenger-chat', { contactId: 'ann' });
    });
    expect(keys()).toEqual({ 'messenger-chat:ann': true });

    await reply();
    expect(keys()).toEqual({});
  });

  it('drops attention on sign-out', async () => {
    await signInWithAnnWaiting();
    act(() => getMessengerEngine().signOut());
    expect(useAttentionStore.getState().keys).toEqual({});
  });

  it('double-clicking a contact opens their chat window', async () => {
    useWindowsStore.setState({ windows: [], topZ: 0 });
    const user = await signIn();
    await user.dblClick(screen.getByText('Ann'));
    expect(useWindowsStore.getState().windows).toMatchObject([
      { appId: 'messenger-chat', props: { contactId: 'ann' } },
    ]);
  });
});

describe('player header', () => {
  it('persists the personal message edit', async () => {
    const user = await signIn();
    const input = screen.getByLabelText('Personal message');
    await user.type(input, 'listening to nothing{Enter}');
    expect(useMessengerStore.getState().progress.player.personalMessage).toBe(
      'listening to nothing',
    );
    const stored = JSON.parse(
      localStorage.getItem('still-online:v1:messenger') ?? '{}',
    );
    expect(JSON.stringify(stored)).toContain('listening to nothing');
  });

  it('changes the own status', async () => {
    const user = await signIn();
    await user.selectOptions(screen.getByLabelText('My status'), 'busy');
    expect(useMessengerStore.getState().progress.player.status).toBe('busy');
  });
});

describe('tray icon', () => {
  it('is grey when signed out and green when signed in', () => {
    render(<Taskbar />);
    const button = screen.getByRole('button', { name: 'Messenger' });
    expect(button.getAttribute('data-signed-in')).toBe('false');
    act(() => getMessengerEngine().signIn());
    expect(button.getAttribute('data-signed-in')).toBe('true');
    expect(within(button).getByRole('img').getAttribute('data-status')).toBe(
      'online',
    );
  });
});

describe('buildContactList', () => {
  it('omits empty groups and sorts by display name', () => {
    const list = buildContactList(
      [contents[1]!.contact, contents[0]!.contact],
      {},
      { ann: true, bob: true },
    );
    expect(list.map((g) => g.id)).toEqual(['Friends']);
    expect(list[0]!.entries.map((e) => e.contact.id)).toEqual(['ann', 'bob']);
  });
});

describe('now playing', () => {
  const track = {
    trackId: 't1',
    artist: 'The Paper Kites',
    title: 'Bloom',
    durationSec: 200,
  };

  beforeEach(() => useNowPlayingStore.setState({ track: null }));

  it('puts the track in the personal message only while the toggle is on', async () => {
    const { events } = await import('@/os/events');
    const user = await signIn();
    const box = screen.getByLabelText('Personal message');

    act(() => events.emit('amplifier:trackChanged', track));
    expect(box).toHaveValue('');

    await user.click(screen.getByLabelText("Show what I'm listening to"));
    act(() =>
      events.emit('amplifier:trackChanged', {
        ...track,
        title: 'Featherstone',
      }),
    );
    expect(box).toHaveValue('♫ The Paper Kites - Featherstone');
    expect(useMessengerStore.getState().progress.player.personalMessage).toBe(
      '♫ The Paper Kites - Featherstone',
    );
  });

  it('shows a track that started before the toggle was ticked', async () => {
    const { events } = await import('@/os/events');
    act(() => events.emit('amplifier:trackChanged', track));
    const user = await signIn();
    const box = screen.getByLabelText('Personal message');
    expect(box).toHaveValue('');

    await user.click(screen.getByLabelText("Show what I'm listening to"));
    expect(box).toHaveValue('♫ The Paper Kites - Bloom');
  });

  it('restores the own personal message on stop and on untick', async () => {
    const { events } = await import('@/os/events');
    const user = await signIn();
    const box = screen.getByLabelText('Personal message');
    await user.type(box, 'studying{Enter}');
    const toggle = screen.getByLabelText("Show what I'm listening to");
    await user.click(toggle);

    act(() => events.emit('amplifier:trackChanged', track));
    expect(box).toHaveValue('♫ The Paper Kites - Bloom');
    act(() => events.emit('amplifier:stopped', { trackId: 't1' }));
    expect(box).toHaveValue('studying');

    act(() => events.emit('amplifier:trackChanged', track));
    expect(box).toHaveValue('♫ The Paper Kites - Bloom');
    await user.click(toggle);
    expect(box).toHaveValue('studying');
  });

  it('keeps a message the player types while a track is shown', async () => {
    const { events } = await import('@/os/events');
    const user = await signIn();
    const box = screen.getByLabelText('Personal message');
    await user.click(screen.getByLabelText("Show what I'm listening to"));
    act(() => events.emit('amplifier:trackChanged', track));

    await user.clear(box);
    await user.type(box, 'brb{Enter}');
    act(() => events.emit('amplifier:stopped', { trackId: 't1' }));
    expect(box).toHaveValue('brb');
  });

  it('fires onNowPlaying scripts once per trackId', async () => {
    const { events } = await import('@/os/events');
    const { say } = await import('./engine/test-helpers');
    setMessengerContentsForTests([
      contactContent(
        'ann',
        [say('np', { type: 'onNowPlaying' }, ['ooh {title}'], true)],
        { displayName: 'Ann', signInAfterMs: 0 },
      ),
    ]);
    const user = await signIn();
    await user.click(screen.getByLabelText("Show what I'm listening to"));
    act(() => events.emit('amplifier:trackChanged', track));
    act(() => events.emit('amplifier:trackChanged', track));
    await act(() => vi.advanceTimersByTimeAsync(10_000));
    const transcript =
      useMessengerStore.getState().progress.contacts.ann?.transcript ?? [];
    expect(transcript.filter((m) => m.kind === 'message')).toHaveLength(1);
  });

  it('updates the personal message when the real Amplifier plays a track', async () => {
    const audio = Object.assign(new EventTarget(), {
      src: '',
      currentTime: 0,
      duration: NaN,
      volume: 1,
      muted: false,
      play: vi.fn(() => Promise.resolve()),
      pause: vi.fn(),
      removeAttribute: vi.fn(),
    }) as unknown as HTMLAudioElement;
    const amplifier = createAmplifierStore({
      audio,
      playlist: [
        {
          id: 'p1',
          title: 'Bloom',
          artist: 'The Paper Kites',
          file: 'music/p1.mp3',
          durationSec: 200,
          license: 'CC BY 4.0',
        },
      ],
    });
    const user = await signIn();
    await user.click(screen.getByLabelText("Show what I'm listening to"));
    act(() => amplifier.getState().play());
    expect(screen.getByLabelText('Personal message')).toHaveValue(
      '♫ The Paper Kites - Bloom',
    );
  });
});
