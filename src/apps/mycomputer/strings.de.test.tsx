// P1-04: the About / My Computer pane in German.
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useSettingsStore } from '@/os/store/settings';
import MyComputer from './MyComputer';

beforeEach(() => useSettingsStore.setState({ language: 'de' }));
afterEach(() => useSettingsStore.setState({ language: 'en' }));

describe('My Computer in German', () => {
  it('shows the German about text, credits and reset button', () => {
    render(<MyComputer />);
    expect(screen.getByText('Danksagungen')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /zurücksetzen…/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Nostalgie-Simulator/)).toBeInTheDocument();
  });
});
