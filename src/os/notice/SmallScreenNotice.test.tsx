import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SmallScreenNotice } from '@/os/notice/SmallScreenNotice';
import { useSettingsStore } from '@/os/store/settings';

function mockMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  useSettingsStore.setState({ smallScreenNoticeDismissed: false });
});

afterEach(() => {
  // @ts-expect-error restore jsdom default (no matchMedia)
  delete window.matchMedia;
});

describe('SmallScreenNotice', () => {
  it('is shown under 900px', () => {
    mockMedia(true);
    render(<SmallScreenNotice />);
    expect(
      screen.getByText(
        'still online is best experienced on a desktop computer.',
      ),
    ).toBeInTheDocument();
  });

  it('is not shown on a large fine-pointer screen', () => {
    mockMedia(false);
    render(<SmallScreenNotice />);
    expect(screen.queryByTestId('small-screen-notice')).toBeNull();
  });

  it('is not shown after dismissal, and the dismissal is remembered', () => {
    mockMedia(true);
    const { unmount } = render(<SmallScreenNotice />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue anyway' }));
    expect(screen.queryByTestId('small-screen-notice')).toBeNull();
    expect(useSettingsStore.getState().smallScreenNoticeDismissed).toBe(true);
    unmount();
    render(<SmallScreenNotice />);
    expect(screen.queryByTestId('small-screen-notice')).toBeNull();
  });
});
