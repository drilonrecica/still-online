import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import '@/apps/registry';
import type { ContactProgress, TranscriptEntry } from '@/content/types';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { contactContent } from '../engine/test-helpers';
import { setMessengerContentsForTests } from '../runtime';
import { useMessengerStore } from '../store';
import { groupByDay } from './groups';
import History from './History';
import Messenger from '../Messenger';

const at = (m: number, d: number) => new Date(2026, m, d, 12).getTime();
const msg = (
  from: 'contact' | 'player',
  text: string,
  when: number,
): TranscriptEntry => ({ kind: 'message', from, text, at: when });

function seed(id: string, transcript: TranscriptEntry[]) {
  useMessengerStore.setState((s) => {
    const base = s.progress.contacts[id] as ContactProgress | undefined;
    return {
      progress: {
        ...s.progress,
        contacts: {
          ...s.progress.contacts,
          [id]: { ...(base as ContactProgress), transcript },
        },
      },
    };
  });
}

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState({ playerName: 'Drilon' });
  useMessengerStore.setState(useMessengerStore.getInitialState(), true);
  useWindowsStore.setState({ windows: [], topZ: 0 });
  setMessengerContentsForTests([
    contactContent('ann', [], { displayName: 'Ann' }),
    contactContent('bob', [], { displayName: 'Bob' }),
    contactContent('cy', [], { displayName: 'Cy' }),
  ]);
  const t = useMessengerStore.getState().progress.contacts;
  useMessengerStore.setState((s) => ({
    progress: {
      ...s.progress,
      contacts: Object.fromEntries(
        ['ann', 'bob', 'cy'].map((id) => [
          id,
          t[id] ?? {
            everSignedIn: false,
            status: 'online',
            personalMessage: '',
            active: null,
            queue: [],
            scripts: {},
            transcript: [],
            unread: 0,
            presenceDay: 1,
          },
        ]),
      ) as typeof s.progress.contacts,
    },
  }));
  seed('ann', [
    msg('contact', 'hello there', at(9, 16)),
    msg('player', 'hi Ann', at(9, 16)),
    msg('contact', 'see you later', at(9, 17)),
  ]);
  seed('bob', [msg('contact', 'yo', at(9, 17))]);
});

afterEach(() => setMessengerContentsForTests([]));

const props = (p: Record<string, string> = {}) => ({
  windowId: 'w',
  props: p,
});

describe('groupByDay', () => {
  it('groups by game-year date from `at`', () => {
    const g = groupByDay([
      msg('contact', 'a', at(9, 16)),
      msg('contact', 'b', at(9, 16)),
      msg('contact', 'c', at(9, 17)),
    ]);
    expect(g.map((x) => x.label)).toEqual([
      'Tuesday, October 16, 2007',
      'Wednesday, October 17, 2007',
    ]);
    expect(g[0]!.entries).toHaveLength(2);
  });
  it('filters by search, case-insensitively', () => {
    const g = groupByDay([msg('contact', 'Hello', at(9, 16))], 'ELL');
    expect(g).toHaveLength(1);
    expect(groupByDay([msg('contact', 'Hello', at(9, 16))], 'zzz')).toEqual([]);
  });
});

describe('History', () => {
  it('lists only contacts with history, with counts', () => {
    render(<History {...props()} />);
    const list = screen.getByRole('listbox');
    expect(within(list).getAllByRole('option')).toHaveLength(2);
    expect(within(list).getByText('(3)')).toBeInTheDocument();
    expect(within(list).queryByText('Cy')).toBeNull();
  });

  it('shows date separators and selects the contact from props', async () => {
    render(<History {...props({ contactId: 'bob' })} />);
    expect(screen.getByText('Wednesday, October 17, 2007')).toBeInTheDocument();
    expect(screen.getByText('yo')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('option', { name: /Ann/ }));
    expect(screen.getByText('Tuesday, October 16, 2007')).toBeInTheDocument();
    expect(screen.getByText('hi Ann')).toBeInTheDocument();
  });

  it('search filters and highlights', async () => {
    render(<History {...props({ contactId: 'ann' })} />);
    await userEvent.type(screen.getByLabelText('Search messages'), 'later');
    expect(screen.queryByText('hi Ann')).toBeNull();
    expect(screen.getByText('later').tagName).toBe('MARK');
    await userEvent.clear(screen.getByLabelText('Search messages'));
    await userEvent.type(screen.getByLabelText('Search messages'), 'qqq');
    expect(screen.getByText('No messages found.')).toBeInTheDocument();
  });

  it('Clear History confirms, clears only the transcript', async () => {
    useMessengerStore.setState((s) => ({
      progress: {
        ...s.progress,
        contacts: {
          ...s.progress.contacts,
          ann: { ...s.progress.contacts.ann!, presenceDay: 3 },
        },
      },
    }));
    render(<History {...props({ contactId: 'ann' })} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Clear History' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'No' }));
    expect(
      useMessengerStore.getState().progress.contacts.ann!.transcript,
    ).toHaveLength(3);
    await userEvent.click(
      screen.getByRole('button', { name: 'Clear History' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Yes' }));
    const c = useMessengerStore.getState().progress.contacts.ann!;
    expect(c.transcript).toEqual([]);
    expect(c.presenceDay).toBe(3);
    expect(screen.queryByRole('option', { name: /Ann/ })).toBeNull();
  });

  it('opens from the Messenger File menu', async () => {
    useMessengerStore.setState({ signedIn: true });
    render(<Messenger />);
    await userEvent.click(screen.getByRole('menuitem', { name: 'File' }));
    await userEvent.click(
      screen.getByRole('menuitem', { name: /View Message History/ }),
    );
    expect(
      useWindowsStore
        .getState()
        .windows.some((w) => w.appId === 'messenger-history'),
    ).toBe(true);
    act(() => {});
  });
});
