import { act, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSettingsStore } from '@/os/store/settings';
import { useLocale, useT } from './useT';

function CancelButton() {
  const t = useT();
  return <button type="button">{t('common.cancel')}</button>;
}

describe('useT / useLocale', () => {
  it('re-renders on a language switch', () => {
    render(<CancelButton />);
    expect(screen.getByRole('button')).toHaveTextContent('Cancel');
    act(() => useSettingsStore.getState().setLanguage('de'));
    expect(screen.getByRole('button')).toHaveTextContent('Abbrechen');
    act(() => useSettingsStore.getState().setLanguage('en'));
    expect(screen.getByRole('button')).toHaveTextContent('Cancel');
  });

  it('keeps the same t until the locale changes', () => {
    const { result, rerender } = renderHook(() => ({
      t: useT(),
      locale: useLocale(),
    }));
    const first = result.current.t;
    rerender();
    expect(result.current.t).toBe(first);
    act(() => useSettingsStore.getState().setLanguage('de'));
    expect(result.current.locale).toBe('de');
    expect(result.current.t).not.toBe(first);
  });
});
