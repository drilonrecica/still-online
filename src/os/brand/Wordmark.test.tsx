import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { APP_TAGLINE } from './brand';
import { Wordmark } from './Wordmark';

describe('Wordmark', () => {
  it('renders the name as real text with a decorative mark', () => {
    render(<Wordmark />);
    expect(screen.getByTestId('wordmark')).toHaveTextContent(/^still online$/);
    expect(document.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('shows the edition and tagline only when asked', () => {
    const { rerender } = render(<Wordmark />);
    expect(screen.queryByText(APP_TAGLINE)).toBeNull();
    expect(screen.queryByText('2007 Edition')).toBeNull();
    rerender(<Wordmark edition tagline />);
    expect(screen.getByText(APP_TAGLINE)).toBeInTheDocument();
    expect(screen.getByText('2007 Edition')).toBeInTheDocument();
  });
});
