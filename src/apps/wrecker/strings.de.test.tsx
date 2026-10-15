// P1-06: Desktop Wrecker's palette and stamp text in German.
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useSettingsStore } from '@/os/store/settings';
import { t } from '@/i18n/t';
import { Palette } from './Palette';

beforeEach(() => useSettingsStore.setState({ language: 'de' }));
afterEach(() => useSettingsStore.setState({ language: 'en' }));

describe('Desktop Wrecker in German', () => {
  it('labels the tools, repair and exit', () => {
    render(
      <Palette
        tool="hammer"
        repairing={false}
        onSelect={() => undefined}
        onRepair={() => undefined}
        onExit={() => undefined}
      />,
    );
    expect(
      screen.getByRole('toolbar', { name: 'Randale-Werkzeuge' }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Kettensäge' })).toHaveAttribute(
      'title',
      'Kettensäge: Halten und ziehen zum Sägen',
    );
    expect(screen.getByRole('button', { name: 'Reparieren' })).toBeVisible();
    expect(screen.getByRole('button', { name: /Beenden/ })).toBeVisible();
  });

  it('stamps BUMM! instead of BOOM!', () => {
    expect(t('wrecker.boom')).toBe('BUMM!');
  });
});
