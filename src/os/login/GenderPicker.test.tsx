import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import type { Gender } from '@/os/types';
import { GenderPicker } from './GenderPicker';

function Harness({ initial }: { initial: Gender | null }) {
  const [value, setValue] = useState(initial);
  return <GenderPicker label="I am a:" value={value} onChange={setValue} />;
}

const radio = (name: 'Girl' | 'Boy') => screen.getByRole('radio', { name });

describe('GenderPicker', () => {
  it('with no choice, nothing is checked and Girl is the one tab stop', () => {
    render(<Harness initial={null} />);
    expect(radio('Girl')).not.toBeChecked();
    expect(radio('Boy')).not.toBeChecked();
    expect(radio('Girl')).toHaveAttribute('tabindex', '0');
    expect(radio('Boy')).toHaveAttribute('tabindex', '-1');
  });

  it('arrow keys pick and move focus, wrapping around', () => {
    render(<Harness initial={null} />);
    radio('Girl').focus();
    fireEvent.keyDown(radio('Girl'), { key: 'ArrowRight' });
    expect(radio('Girl')).toBeChecked();
    fireEvent.keyDown(radio('Girl'), { key: 'ArrowDown' });
    expect(radio('Boy')).toBeChecked();
    expect(radio('Boy')).toHaveFocus();
    expect(radio('Boy')).toHaveAttribute('tabindex', '0');
    expect(radio('Girl')).toHaveAttribute('tabindex', '-1');
    fireEvent.keyDown(radio('Boy'), { key: 'ArrowRight' });
    expect(radio('Girl')).toBeChecked();
    expect(radio('Girl')).toHaveFocus();
    fireEvent.keyDown(radio('Girl'), { key: 'ArrowLeft' });
    expect(radio('Boy')).toBeChecked();
  });

  it('ArrowLeft from no choice picks the last option', () => {
    render(<Harness initial={null} />);
    fireEvent.keyDown(radio('Girl'), { key: 'ArrowLeft' });
    expect(radio('Boy')).toBeChecked();
  });

  it('click picks; other keys do nothing', () => {
    render(<Harness initial="girl" />);
    fireEvent.keyDown(radio('Girl'), { key: 'a' });
    expect(radio('Girl')).toBeChecked();
    fireEvent.click(radio('Boy'));
    expect(radio('Boy')).toBeChecked();
    expect(radio('Girl')).not.toBeChecked();
  });
});
