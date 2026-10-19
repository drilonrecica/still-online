// P1-05: the Top 8 editor (add / remove / reorder, keyboard operable), the `web:top8Changed` diff
// it emits on save, and the drop / re-add reactions on the `/me` wall.
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FRIENDSPACE_HOST } from '@/content/sites/friendspace';
import { events } from '@/os/events';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore } from '@/os/world';
import '@/apps/registry';
import Browser from '../../Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from '../../store';

function open(path: string) {
  const url = `http://${FRIENDSPACE_HOST}${path}`;
  const windowId = useWindowsStore.getState().openApp('browser', { url });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Browser windowId={windowId} props={{ url }} />);
  return user;
}
const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(1400));

async function openEditor(language: 'en' | 'de' = 'en') {
  useSettingsStore.setState({ language });
  const user = open('/me');
  await finishLoad();
  await user.click(
    await screen.findByRole('button', {
      name: language === 'en' ? 'Edit Profile' : 'Profil bearbeiten',
    }),
  );
  return {
    user,
    list: screen.getByRole('list', {
      name: language === 'en' ? 'Top 8 order' : 'Reihenfolge der Top 8',
    }),
  };
}
const names = (list: HTMLElement) =>
  within(list)
    .getAllByRole('listitem')
    .map((li) => li.querySelector('span')?.textContent);

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({
    connectAutomatically: true,
    muted: true,
    playerName: 'Ada',
  });
  useWebStore.setState({ ...WEB_DEFAULTS, favorites: [...DEFAULT_FAVORITES] });
  useWorldStore.setState({ day: 1 });
  useNetworkStore.setState({
    status: 'online',
    kbps: 56,
    phase: 'connected',
    connectedAt: null,
  });
});

afterEach(() => {
  useNetworkStore.getState().cancel();
  vi.useRealTimers();
});

describe('Top 8 editor', () => {
  it('removes entries, then adds a band and an extra from the picker', async () => {
    const changed = vi.fn();
    const off = events.on('web:top8Changed', changed);
    const { user, list } = await openEditor();
    const first = names(list)[0]!;
    expect(names(list)).toHaveLength(6);
    await user.click(
      screen.getByRole('button', { name: `Remove ${first} from the Top 8` }),
    );
    expect(names(list)).toHaveLength(5);
    expect(names(list)).not.toContain(first);

    const picker = screen.getByRole('combobox', {
      name: 'Pick a friend, band or person',
    });
    const options = within(picker).getAllByRole('option');
    // Friends first (just the one removed), then bands, then extras.
    expect(options[0]).toHaveTextContent(first);
    expect(within(picker).getByRole('group', { name: 'Bands' })).toBeTruthy();
    expect(within(picker).getByRole('group', { name: 'Others' })).toBeTruthy();
    await user.selectOptions(
      picker,
      within(within(picker).getByRole('group', { name: 'Bands' })).getAllByRole(
        'option',
      )[0]!,
    );
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(names(list)).toHaveLength(6);

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    const saved = useWebStore.getState().myProfile!;
    expect(saved.top8).toHaveLength(6);
    expect(saved.top8.at(-1)?.kind).toBe('band');
    expect(saved.top8.map((e) => e.kind === 'contact' && e.id)).not.toContain(
      first.toLowerCase(),
    );
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.calls[0]![0].dropped).toHaveLength(1);
    expect(changed.mock.calls[0]![0].added).toEqual([]);
    off();
  });

  it('caps the Top 8 at 8 and never offers a duplicate', async () => {
    const { user, list } = await openEditor();
    const picker = () =>
      screen.queryByRole('combobox', { name: 'Pick a friend, band or person' });
    while (names(list).length < 8) {
      await user.click(screen.getByRole('button', { name: 'Add' }));
    }
    expect(names(list)).toHaveLength(8);
    expect(new Set(names(list)).size).toBe(8);
    expect(picker()).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add' })).toBeNull();
    await user.click(
      screen.getByRole('button', {
        name: `Remove ${names(list)[0]} from the Top 8`,
      }),
    );
    expect(picker()).not.toBeNull();
  });

  it('reorders with the keyboard', async () => {
    const { user, list } = await openEditor();
    const [a, b] = names(list);
    const down = screen.getByRole('button', { name: `Move ${a} down` });
    down.focus();
    await user.keyboard('{Enter}');
    expect(names(list).slice(0, 2)).toEqual([b, a]);
    await user.tab();
    expect(document.activeElement).toBeInstanceOf(HTMLButtonElement);
  });

  it('saves a re-add as `added` and a drop as `dropped`', async () => {
    const changed = vi.fn();
    const off = events.on('web:top8Changed', changed);
    const { user, list } = await openEditor();
    const first = names(list)[0]!;
    await user.click(
      screen.getByRole('button', { name: `Remove ${first} from the Top 8` }),
    );
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(changed).toHaveBeenCalledTimes(1);
    const { dropped } = changed.mock.calls[0]![0];
    expect(dropped).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Edit Profile' }));
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(changed).toHaveBeenCalledTimes(2);
    expect(changed.mock.calls[1]![0]).toEqual({ dropped: [], added: dropped });
    off();
  });

  it('saves the mood history when the mood changes', async () => {
    const { user } = await openEditor();
    const mood = screen.getByLabelText('Mood:');
    await user.clear(mood);
    await user.type(mood, 'dramatic');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(useWebStore.getState().myProfile?.moodHistory?.[0]).toMatchObject({
      text: 'dramatic',
      day: 1,
    });
  });
});

describe('Top 8 wall reactions on /me', () => {
  it('shows a drop and a re-add reaction, merged by day', async () => {
    useWorldStore.setState({ day: 3 });
    useWebStore.setState({
      top8Wall: [
        { contactId: 'kayla', kind: 'dropped', day: 2 },
        { contactId: 'kayla', kind: 'readded', day: 3 },
      ],
    });
    open('/me');
    await finishLoad();
    const wall = within(
      await screen.findByRole('list', { name: 'Comments' }),
    ).getAllByRole('listitem');
    const text = wall.map((li) => li.textContent ?? '');
    const dropped = text.findIndex((t) => t.includes('real friends stay true'));
    const readded = text.findIndex((t) => t.includes('ONLY bc u put me back'));
    expect(dropped).toBeGreaterThan(-1);
    expect(readded).toBeGreaterThan(-1);
    expect(readded).toBeLessThan(dropped); // newest day first
    expect(wall[dropped]).toHaveTextContent('Ada'); // `{name}` filled
  });
});

describe('Top 8 editor in German', () => {
  it('has German labels and removes and re-adds', async () => {
    const { user, list } = await openEditor('de');
    const first = names(list)[0]!;
    await user.click(
      screen.getByRole('button', { name: `${first} aus den Top 8 entfernen` }),
    );
    expect(names(list)).toHaveLength(5);
    expect(
      screen.getByRole('combobox', {
        name: 'Freund, Band oder Person auswählen',
      }),
    ).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Freunde' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Bands' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Hinzufügen' }));
    expect(names(list)).toHaveLength(6);
    expect(
      screen.getByRole('button', { name: `${names(list)[0]} nach unten` }),
    ).toBeTruthy();
  });
});
