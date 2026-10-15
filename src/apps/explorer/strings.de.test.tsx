// P1-04: the Explorer's image viewer in German.
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FsNode } from '@/os/fs/types';
import { useSettingsStore } from '@/os/store/settings';
import { ImageViewer } from './ImageViewer';

beforeEach(() => useSettingsStore.setState({ language: 'de' }));
afterEach(() => useSettingsStore.setState({ language: 'en' }));

describe('Image viewer in German', () => {
  it('shows German buttons, position and the empty-picture message', () => {
    const image = { id: 'x', name: 'bild.png', type: 'image' } as FsNode;
    render(
      <ImageViewer
        image={image}
        position={2}
        count={3}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Zurück zum Ordner' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Weiter' })).toBeInTheDocument();
    expect(screen.getByText('bild.png (2 von 3)')).toBeInTheDocument();
    expect(
      screen.getByText('Dieses Bild kann nicht angezeigt werden.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Originalgröße' }),
    ).toBeInTheDocument();
  });
});
