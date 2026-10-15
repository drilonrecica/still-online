// P1-02: the Messenger chrome (contact list, chat window, away dialogs, toasts) in German.
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@/apps/registry';
import { useSettingsStore } from '@/os/store/settings';
import { useToastStore } from '@/os/toast/store';
import { useWindowsStore } from '@/os/store/windows';
import Chat from './chat/Chat';
import { contactContent } from './engine/test-helpers';
import History from './history/History';
import Messenger from './Messenger';
import { setMessengerContentsForTests } from './runtime';
import { useMessengerStore } from './store';
import { summarizeAway } from './awaySummary';

const lena = contactContent('lena', [], { displayName: 'Lena' });

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState({
    playerName: 'Drilon',
    muted: true,
    language: 'de',
  });
  useMessengerStore.setState(useMessengerStore.getInitialState(), true);
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useToastStore.getState().clear();
  setMessengerContentsForTests([lena]);
});

afterEach(() => {
  setMessengerContentsForTests([]);
  useSettingsStore.setState({ language: 'en' });
  vi.useRealTimers();
});

describe('Messenger in German', () => {
  it('shows the signed-out view in German', () => {
    render(<Messenger />);
    expect(
      screen.getByRole('heading', { name: 'Bei Messenger anmelden' }),
    ).toBeInTheDocument();
    expect(screen.getByText('E-Mail-Adresse:')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Anmelden' }),
    ).toBeInTheDocument();
  });

  it('renders the contact list chrome in German', async () => {
    useMessengerStore.setState({ signedIn: true, online: { lena: true } });
    render(<Messenger />);
    expect(screen.getByRole('menuitem', { name: 'Datei' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: /Freunde \(1\/1\)/ }),
    ).toBeInTheDocument();
    const status = screen.getByRole('combobox', { name: 'Mein Status' });
    expect(
      within(status)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(['Online', 'Abwesend', 'Beschäftigt', 'Als offline anzeigen']);
    expect(
      screen.getByPlaceholderText('<Persönliche Nachricht eingeben>'),
    ).toBeInTheDocument();
    expect(screen.getByText('1 Kontakt')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abmelden' })).toBeVisible();

    const user = userEvent.setup();
    await user.click(screen.getByRole('menuitem', { name: 'Datei' }));
    expect(
      screen.getByRole('menuitem', { name: 'Nachrichtenverlauf anzeigen…' }),
    ).toBeVisible();
    await user.click(screen.getByRole('menuitem', { name: 'Optionen…' }));
    const dialog = screen.getByRole('dialog', { name: 'Optionen' });
    expect(
      within(dialog).getByRole('button', { name: 'Abbrechen' }),
    ).toBeVisible();
  });

  it('renders the chat window chrome and system lines in German', async () => {
    useMessengerStore.setState({ signedIn: true, online: { lena: true } });
    const windowId = useWindowsStore
      .getState()
      .openApp('messenger-chat', { contactId: 'lena' });
    render(<Chat windowId={windowId} props={{ contactId: 'lena' }} />);
    expect(screen.getByText(/^An:/)).toBeInTheDocument();
    expect(screen.getByRole('toolbar', { name: 'Unterhaltungswerkzeuge' }));
    expect(screen.getByRole('button', { name: 'Verlauf' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Senden' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Winks ▾' })).toBeVisible();
    expect(screen.getByRole('log', { name: 'Unterhaltung' })).toBeVisible();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Nudge' }));
    expect(screen.getByRole('log', { name: 'Unterhaltung' })).toHaveTextContent(
      'Sie haben gerade einen Nudge gesendet!',
    );
    await user.click(screen.getByRole('button', { name: 'Nudge' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Sie können nicht so oft einen Nudge senden.',
    );

    await user.click(screen.getByRole('button', { name: 'Winks ▾' }));
    expect(screen.getByRole('menuitem', { name: 'Kuss' })).toBeVisible();
    await user.click(screen.getByRole('menuitem', { name: 'Kuss' }));
    expect(screen.getByRole('log', { name: 'Unterhaltung' })).toHaveTextContent(
      'Sie haben einen Wink gesendet: Kuss',
    );
  });

  it('shows the empty history in German', () => {
    render(<History windowId="h" props={{}} />);
    expect(
      screen.getByText('Kein Nachrichtenverlauf vorhanden.'),
    ).toBeInTheDocument();
  });

  it('words the while-you-were-away summary in German', () => {
    const base = {
      status: 'online',
      unread: 0,
      transcript: [
        { kind: 'message', from: 'contact', text: 'x', at: 5, whileAway: true },
      ],
    };
    const out = summarizeAway({ a: base, b: base } as never, 0, (id) =>
      id.toUpperCase(),
    );
    expect(out?.text).toBe('2 Nachrichten von A, B');
    act(() => undefined);
  });
});
