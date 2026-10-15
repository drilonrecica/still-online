// Consumers read content through the accessors and follow a language switch live. The German
// modules are still English re-exports (P2 fills them), so this test swaps in German stubs.
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getLocalizedContents } from '@/apps/messenger/runtime';
import Home from '@/apps/browser/sites/spaceport/Home';
import { useSettingsStore } from '@/os/store/settings';
import { getContacts, getSiteText, type SiteTexts } from './locale';
import { SPACEPORT_HOST, SPACEPORT_TEXT } from './sites/spaceport';

vi.mock('@/content/de/sites/spaceport', async (importOriginal) => {
  const en = await importOriginal<typeof import('./sites/spaceport')>();
  return {
    ...en,
    SPACEPORT_TEXT: {
      ...en.SPACEPORT_TEXT,
      tagline: 'ein Ort für Freunde im Orbit',
    },
  };
});
vi.mock('@/content/de/contacts/jess', () => ({
  jess: { personalMessage: 'OMG noch 3 Tage!!!1 (L)', scripts: {} },
}));

// A German module with different strings must type-check against the English shape.
const german: SiteTexts[typeof SPACEPORT_HOST]['SPACEPORT_TEXT'] = {
  ...SPACEPORT_TEXT,
  logIn: 'Einloggen',
};

describe('content follows the language', () => {
  it('a site page re-renders with the German module on a switch', () => {
    expect(german.logIn).toBe('Einloggen');
    render(<Home path="/" query={new URLSearchParams()} navigate={() => {}} />);
    expect(screen.getAllByText(SPACEPORT_TEXT.tagline).length).toBeGreaterThan(
      0,
    );
    act(() => useSettingsStore.setState({ language: 'de' }));
    expect(
      screen.getAllByText('ein Ort für Freunde im Orbit').length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(SPACEPORT_TEXT.tagline)).toBeNull();
    expect(getSiteText(SPACEPORT_HOST, 'en').SPACEPORT_TEXT.tagline).toBe(
      SPACEPORT_TEXT.tagline,
    );
  });

  it('Messenger renders shipped contacts through the merged overlays', () => {
    const jess = (locale: 'en' | 'de') =>
      getLocalizedContents(locale).find((c) => c.contact.id === 'jess')!;
    expect(jess('de').contact.personalMessage).toBe('OMG noch 3 Tage!!!1 (L)');
    expect(jess('en').contact.personalMessage).toBe('OMG 3 more days!!!1 (L)');
    expect(getContacts('de').find((c) => c.contact.id === 'jess')).toBe(
      jess('de'),
    );
  });
});
