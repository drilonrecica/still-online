// P2-06: every fictional site and Friendspace profile in German, and a live switch back to English.
import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore } from '@/os/world';
import '@/apps/registry';
import Browser from '../Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from '../store';

const LOAD = 1400;

function open(url: string) {
  const windowId = useWindowsStore.getState().openApp('browser', { url });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Browser windowId={windowId} props={{ url }} />);
  return { user, windowId };
}
const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(LOAD));
const windowTitle = (id: string) =>
  useWindowsStore.getState().windows.find((w) => w.id === id);

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({
    connectAutomatically: true,
    muted: true,
    playerName: 'Ada',
    language: 'de',
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

describe('sites in German', () => {
  it('about.example welcomes and gives Surftipps', async () => {
    const { user } = open('http://about.example/');
    await finishLoad();
    expect(
      await screen.findByRole('heading', {
        name: 'Willkommen bei Web Explorer!',
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Westfield-Gymnasium' }),
    ).toBeTruthy();
    await user.click(screen.getByRole('link', { name: 'Surftipps »' }));
    await finishLoad();
    expect(
      await screen.findByText(/Verraten Sie Fremden niemals/),
    ).toBeTruthy();
  });

  it('Searchly searches the German index and speaks German', async () => {
    const { user, windowId } = open('http://searchly.example/');
    await finishLoad();
    expect(await screen.findByText(/Probieren Sie:/)).toBeTruthy();
    await user.type(
      screen.getByRole('textbox', { name: 'Das Web durchsuchen' }),
      'Gästebuch',
    );
    await user.click(screen.getByRole('button', { name: 'Searchly-Suche' }));
    await finishLoad();
    expect(
      await screen.findByRole('link', {
        name: 'Tinfoil Comets Fanseite - Gästebuch',
      }),
    ).toBeTruthy();
    expect(document.body).toHaveTextContent(
      /Ergebnisse 1 - \d+ von \d+ für Gästebuch/,
    );
    expect(windowTitle(windowId)?.titleParams).toEqual({
      page: 'Searchly Suchergebnisse',
    });

    await user.click(screen.getByRole('link', { name: /Searchly/ }));
    await finishLoad();
    await user.click(
      await screen.findByRole('link', {
        name: /Toolbar — jetzt herunterladen/,
      }),
    );
    expect(
      screen.getByRole('dialog', { name: 'Installation' }),
    ).toHaveTextContent('Searchly Toolbar wird installiert… 3%');
  });

  it('Searchly explains an empty German search', async () => {
    open('http://searchly.example/search?q=xylofonzzz');
    await finishLoad();
    expect(
      await screen.findByText(/Searchly hat keine Seiten gefunden/),
    ).toBeTruthy();
    expect(screen.getByText(/Überprüfen Sie die Schreibweise/)).toBeTruthy();
  });

  it('Celeb Gossip 07 reads like a German gossip mag', async () => {
    useWorldStore.setState({ day: 5 });
    const { user } = open('http://celebgossip07.example/');
    await finishLoad();
    expect(
      await screen.findByRole('article', {
        name: /^EXKLUSIV: Ziggys Drumstick/,
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'TOP oder FLOP?!' }),
    ).toBeTruthy();
    expect(screen.getAllByText(/^von Roxi, heute$/).length).toBe(2);
    await user.click(screen.getByRole('radio', { name: 'igitt' }));
    await user.click(screen.getByRole('button', { name: 'ABSTIMMEN!!!' }));
    expect(screen.getByText(/danke fürs abstimmen!!!/)).toBeTruthy();
    await user.click(screen.getByRole('link', { name: 'WER IST WER' }));
    await finishLoad();
    expect(
      await screen.findByRole('region', { name: 'Starla Vance' }),
    ).toHaveTextContent('berühmt für: pop-prinzessin');
  });

  it('a gossip post shows German comments', async () => {
    useWorldStore.setState({ day: 5 });
    open('http://celebgossip07.example/post?id=tinfoil-recap');
    await finishLoad();
    const comments = await screen.findByRole('region', {
      name: 'Kommentare',
    });
    expect(comments).toHaveTextContent('4 Kommentare');
    expect(comments).toHaveTextContent('xX~JeSs~Xx :D schreibt:');
    expect(comments).toHaveTextContent(/DAS WAR MEIN GESICHT/);
    expect(comments).toHaveTextContent(/danke auch, hater_patrol/);
  });

  it('the Tinfoil Comets fan page and its guestbook are German', async () => {
    const { user } = open('http://tinfoilcomets.example/');
    await finishLoad();
    expect(await screen.findByText('BAUSTELLE')).toBeTruthy();
    expect(screen.getByRole('img', { name: '004.203 Besuche' })).toBeTruthy();
    expect(
      screen.getByRole('navigation', { name: 'Webring' }),
    ).toHaveTextContent(
      '◀ Zurück | Tinfoil Comets Webring | Zufall | Weiter ▶',
    );

    await user.click(
      screen.getByRole('link', { name: 'Trag dich in mein GÄSTEBUCH ein!!' }),
    );
    await finishLoad();
    await screen.findByLabelText('Nachricht:');
    await user.click(screen.getByRole('button', { name: 'Eintragen!!!' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'du musst schon WAS schreiben!!!',
    );
    await user.type(screen.getByLabelText('Nachricht:'), 'hamster 4ever');
    await user.click(screen.getByRole('button', { name: 'Eintragen!!!' }));
    expect(screen.getByText(/DANKE FÜRS EINTRAGEN/)).toBeTruthy();
    const list = screen.getByRole('list', { name: 'Gästebucheinträge' });
    expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent(
      'Ada hat sich heute eingetragen',
    );
  });

  it('the band page keeps the song titles and German tour notes', async () => {
    useWorldStore.setState({ day: 5 });
    open('http://tinfoilcomets.example/band');
    await finishLoad();
    expect(await screen.findByText('~*~ TOURDATEN ~*~')).toBeTruthy();
    expect(screen.getByText('Space Girl')).toBeTruthy();
    expect(screen.getByText('letzten freitag')).toBeTruthy();
  });

  it('VirusGuard scares in formal German with euro prices', async () => {
    const { user } = open('http://virusguard.example/');
    await finishLoad();
    expect(
      await screen.findByText(
        'ACHTUNG!!! IHR COMPUTER IST ZU 87% INFIZIERT!!!',
      ),
    ).toBeTruthy();
    expect(
      screen.getByRole('columnheader', { name: 'Bedrohung' }),
    ).toBeTruthy();
    expect(screen.getByText('Joke.Kettenbrief.WG.WG.WG')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'JETZT KAUFEN!!!' }));
    expect(
      screen.getByText(/Bezahlsystem befindet sich im Aufbau/),
    ).toBeTruthy();
  });

  it('the Westfield-Gymnasium posts Herr Dalton’s notices', async () => {
    const { user } = open('http://westfield-high.example/');
    await finishLoad();
    expect(
      await screen.findByRole('article', {
        name: 'Biologie: Abgabe der Zellmodelle am Ende der Woche',
      }),
    ).toHaveTextContent('Veröffentlicht heute · Herr Dalton');
    await user.click(screen.getByRole('link', { name: 'Lehrerkollegium' }));
    await finishLoad();
    const dalton = (await screen.findByText('Herr Dalton')).closest('tr');
    expect(dalton).toHaveTextContent('Biologie');
    expect(dalton).toHaveTextContent('Raum 12');
    await user.click(screen.getByRole('link', { name: 'Mensa-Speiseplan' }));
    await finishLoad();
    expect(await screen.findByText('Fischstäbchen')).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Beilage' })).toBeTruthy();
  });
});

describe('Friendspace in German', () => {
  it('a friend profile is fully German', async () => {
    useWorldStore.setState({ day: 5 });
    const { windowId } = open('http://friendspace.example/jess');
    await finishLoad();
    const profile = await screen.findByTestId('profile');
    expect(profile).toHaveTextContent(
      '„~*~ ERSTE REIHE ODER GAR NICHT!!!1 ~*~“',
    );
    expect(profile).toHaveTextContent('Stimmung: AUFGEDREHT');
    expect(
      within(profile).getByRole('region', { name: 'Interessen von Jess' }),
    ).toHaveTextContent('Musik');
    expect(profile).toHaveTextContent('Jess hat 8 Freunde in den Top 8.');
    expect(
      within(profile).getByRole('region', { name: 'Kommentare an Jess' }),
    ).toHaveTextContent(/fotos oder es is nie passiert/);
    expect(windowTitle(windowId)?.titleParams).toEqual({
      page: 'Jess auf Friendspace',
    });
  });

  it('every friend profile has German text', async () => {
    useWorldStore.setState({ day: 5 });
    const samples: Record<string, RegExp> = {
      pia: /sternenstaub is die KÖNIGIN/,
      kayla: /drama-PRINZESSIN/,
      marco: /tante rita/,
      theo: /meistens frösche/,
      dex: /skaten\. essen\. schlafen/,
    };
    for (const [id, text] of Object.entries(samples)) {
      open(`http://friendspace.example/${id}`);
      await finishLoad();
      expect(await screen.findByTestId('profile'), id).toHaveTextContent(text);
      cleanup();
    }
  });

  it('/me starts with German defaults and a German editor', async () => {
    useWorldStore.setState({ day: 2 });
    const { user } = open('http://friendspace.example/me');
    await finishLoad();
    expect(await screen.findByText(/Du bist eingeloggt/)).toHaveTextContent(
      'Hallo Ada! Du bist eingeloggt.',
    );
    expect(screen.getByTestId('profile')).toHaveTextContent(
      'neu auf Friendspace!! ~*glitzer*~ <3',
    );
    await user.click(screen.getByRole('button', { name: 'Profil bearbeiten' }));
    expect(screen.getByLabelText('Überschrift:')).toHaveValue(
      'neu auf Friendspace!! ~*glitzer*~ <3',
    );
    expect(screen.getByRole('option', { name: 'Pink Glitzer' })).toBeTruthy();
    expect(screen.getByRole('option', { name: ':( traurig' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Änderungen speichern' }),
    ).toBeTruthy();
  });
});

describe('Friendspace bulletins in German', () => {
  it('renders the German UI, dot and clears it on opening', async () => {
    open('http://friendspace.example/');
    await finishLoad();
    expect(
      await screen.findByRole('link', { name: /^Bulletins/ }),
    ).toHaveTextContent('Bulletins (neu)');
    cleanup();
    open('http://friendspace.example/bulletins');
    await finishLoad();
    expect(
      await screen.findByRole('heading', { name: 'Bulletin-Ecke' }),
    ).toBeTruthy();
    expect(screen.getAllByText(/Betreff:/)).toHaveLength(3);
    expect(screen.getAllByText(/gepostet heute/)).toHaveLength(3);
    expect(useWebStore.getState().bulletinsSeen).toBe(1);
  });
});

describe('switching language on an open site', () => {
  it('re-renders the page and the window title without a reload', async () => {
    const { windowId } = open('http://westfield-high.example/staff');
    await finishLoad();
    expect(await screen.findByText('Herr Dalton')).toBeTruthy();
    act(() => useSettingsStore.setState({ language: 'en' }));
    expect(await screen.findByText('Mr Dalton')).toBeTruthy();
    expect(
      screen.getByRole('columnheader', { name: 'Department' }),
    ).toBeTruthy();
    expect(windowTitle(windowId)?.titleParams).toEqual({
      page: 'Westfield High School - Staff Directory',
    });
  });
});
