import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { events } from '@/os/events';
import { RichText } from './Transcript';

describe('RichText links', () => {
  const offs: (() => void)[] = [];
  afterEach(() => offs.splice(0).forEach((off) => off()));

  it('renders .example links as buttons that emit browser:open', async () => {
    const onOpen = vi.fn();
    offs.push(events.on('browser:open', onOpen));
    render(<RichText text="check kayla.example/blog :) ok" />);
    await userEvent.click(
      screen.getByRole('button', { name: 'kayla.example/blog' }),
    );
    expect(onOpen).toHaveBeenCalledWith({ url: 'http://kayla.example/blog' });
    expect(screen.getByAltText(':)')).toBeInTheDocument();
  });

  it('leaves text without links alone', () => {
    render(<RichText text="hello" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
