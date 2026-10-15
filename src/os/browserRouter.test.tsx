import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RichText } from '@/apps/messenger/chat/Transcript';
import { events } from '@/os/events';
import { useWindowsStore } from '@/os/store/windows';
import { installBrowserRouter } from './browserRouter';
import '@/apps/registry';

describe('browser:open', () => {
  let off: () => void;
  beforeEach(() => {
    useWindowsStore.setState({ windows: [], topZ: 0 });
    off = installBrowserRouter();
  });
  afterEach(() => off());

  it('opens a Web Explorer window per link', () => {
    events.emit('browser:open', { url: 'http://spaceport.example/kayla' });
    events.emit('browser:open', { url: 'http://about.example/' });
    const windows = useWindowsStore.getState().windows;
    expect(windows.map((w) => [w.appId, w.props.url])).toEqual([
      ['browser', 'http://spaceport.example/kayla'],
      ['browser', 'http://about.example/'],
    ]);
  });

  it('a Messenger link opens Web Explorer at that page', async () => {
    render(<RichText text="omg look at spaceport.example/kayla!!" />);
    await userEvent.click(
      screen.getByRole('button', { name: 'spaceport.example/kayla' }),
    );
    expect(useWindowsStore.getState().windows[0]).toMatchObject({
      appId: 'browser',
      props: { url: 'http://spaceport.example/kayla' },
    });
  });

  it('stops listening after uninstall', () => {
    off();
    events.emit('browser:open', { url: 'http://about.example/' });
    expect(useWindowsStore.getState().windows).toHaveLength(0);
    off = () => {};
  });
});
