// Consumers read content through the accessors and follow a language switch live, using the
// real German modules (the test setup has loaded the German chunk).
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getLocalizedContents } from '@/apps/messenger/runtime';
import Home from '@/apps/browser/sites/friendspace/Home';
import { useSettingsStore } from '@/os/store/settings';
import { getContacts, getSiteText, type SiteTexts } from './locale';
import { FRIENDSPACE_TEXT as DE_FRIENDSPACE_TEXT } from './de/sites/friendspace';
import { FRIENDSPACE_HOST, FRIENDSPACE_TEXT } from './sites/friendspace';

// A German module with different strings must type-check against the English shape.
const german: SiteTexts[typeof FRIENDSPACE_HOST]['FRIENDSPACE_TEXT'] = {
  ...FRIENDSPACE_TEXT,
  logIn: 'Einloggen',
};

describe('content follows the language', () => {
  it('a site page re-renders with the German module on a switch', () => {
    expect(german.logIn).toBe('Einloggen');
    render(<Home path="/" query={new URLSearchParams()} navigate={() => {}} />);
    expect(
      screen.getAllByText(FRIENDSPACE_TEXT.tagline).length,
    ).toBeGreaterThan(0);
    act(() => useSettingsStore.setState({ language: 'de' }));
    expect(
      screen.getAllByText(DE_FRIENDSPACE_TEXT.tagline).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(FRIENDSPACE_TEXT.tagline)).toBeNull();
    expect(getSiteText(FRIENDSPACE_HOST, 'en').FRIENDSPACE_TEXT.tagline).toBe(
      FRIENDSPACE_TEXT.tagline,
    );
  });

  it('Messenger renders shipped contacts through the merged overlays', () => {
    const jess = (locale: 'en' | 'de') =>
      getLocalizedContents(locale).find((c) => c.contact.id === 'jess')!;
    expect(jess('de').contact.personalMessage).toBe('OMG noch 3 TAGE!!!1 (L)');
    expect(jess('en').contact.personalMessage).toBe('OMG 3 more days!!!1 (L)');
    expect(getContacts('de').find((c) => c.contact.id === 'jess')).toBe(
      jess('de'),
    );
  });
});
