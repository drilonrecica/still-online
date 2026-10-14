import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '@/App';
import { useSessionStore } from '@/os/store/session';

beforeEach(() => useSessionStore.setState({ state: 'booting' }));

describe('App', () => {
  it('starts on the boot screen', () => {
    render(<App />);
    expect(screen.getByTestId('boot-screen')).toBeInTheDocument();
  });

  it('shows login after boot, then the desktop', () => {
    useSessionStore.setState({ state: 'login' });
    render(<App />);
    expect(screen.getByTestId('login-screen')).toBeInTheDocument();
  });
});
