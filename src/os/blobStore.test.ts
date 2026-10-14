import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearBlobs,
  deleteBlob,
  getBlob,
  putBlob,
  useBlobUrl,
} from './blobStore';

afterEach(async () => {
  await clearBlobs();
  vi.restoreAllMocks();
});

describe('blobStore (memory fallback)', () => {
  it('round-trips put/get/delete/clear', async () => {
    const blob = new Blob(['hello']);
    const key = await putBlob(blob);
    expect(key).toMatch(/^blob:.+/);
    expect(await getBlob(key)).toBe(blob);

    await deleteBlob(key);
    expect(await getBlob(key)).toBeNull();

    const a = await putBlob(new Blob(['a']));
    const b = await putBlob(new Blob(['b']));
    expect(a).not.toBe(b);
    await clearBlobs();
    expect(await getBlob(a)).toBeNull();
    expect(await getBlob(b)).toBeNull();
  });

  it('returns null for unknown keys', async () => {
    expect(await getBlob('blob:nope')).toBeNull();
  });
});

describe('useBlobUrl', () => {
  it('creates an object URL and revokes it on unmount', async () => {
    const create = vi.fn(() => 'blob:url-1');
    const revoke = vi.fn();
    URL.createObjectURL = create;
    URL.revokeObjectURL = revoke;

    const key = await putBlob(new Blob(['x']));
    const { result, unmount } = renderHook(() => useBlobUrl(key));
    await waitFor(() => expect(result.current).toBe('blob:url-1'));
    expect(revoke).not.toHaveBeenCalled();
    unmount();
    expect(revoke).toHaveBeenCalledWith('blob:url-1');
  });

  it('revokes the old URL when the key changes and is null for null', async () => {
    let n = 0;
    URL.createObjectURL = vi.fn(() => `blob:u${++n}`);
    const revoke = vi.fn();
    URL.revokeObjectURL = revoke;

    const k1 = await putBlob(new Blob(['1']));
    const k2 = await putBlob(new Blob(['2']));
    const { result, rerender } = renderHook(
      ({ k }: { k: string | null }) => useBlobUrl(k),
      { initialProps: { k: k1 as string | null } },
    );
    await waitFor(() => expect(result.current).toBe('blob:u1'));
    rerender({ k: k2 });
    await waitFor(() => expect(result.current).toBe('blob:u2'));
    expect(revoke).toHaveBeenCalledWith('blob:u1');
    await act(async () => rerender({ k: null }));
    expect(result.current).toBeNull();
    expect(revoke).toHaveBeenCalledWith('blob:u2');
  });
});
