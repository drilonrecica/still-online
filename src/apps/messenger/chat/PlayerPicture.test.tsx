import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useSettingsStore } from '@/os/store/settings';
import { PictureFile } from './PlayerPicture';

const background = () =>
  screen
    .getByRole('img', { name: 'me' })
    .querySelector('rect')
    ?.getAttribute('fill');

describe('PlayerPicture default pattern', () => {
  afterEach(() => useSettingsStore.setState({ gender: 'girl' }));

  it('is pink for a girl and switches to blue and green for a boy', () => {
    render(<PictureFile fileId={null} size={48} label="me" />);
    expect(background()).toBe('#fbe0f0');
    act(() => useSettingsStore.setState({ gender: 'boy' }));
    expect(background()).toBe('#dcefe6');
  });
});
