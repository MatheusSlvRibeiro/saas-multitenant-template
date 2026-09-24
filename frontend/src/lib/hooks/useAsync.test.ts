import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAsync } from './useAsync';

describe('useAsync', () => {
    it('starts loading and resolves with data', async () => {
        const { result } = renderHook(() => useAsync(() => Promise.resolve('ok'), []));

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data).toBe('ok');
        expect(result.current.error).toBeNull();
    });

    it('captures a rejection as error instead of throwing', async () => {
        const { result } = renderHook(() => useAsync(() => Promise.reject(new Error('boom')), []));

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data).toBeNull();
        expect(result.current.error).toBeInstanceOf(Error);
    });

    it('re-runs fn when deps change', async () => {
        const fn = vi.fn().mockResolvedValue('value');
        const { rerender } = renderHook(({ dep }) => useAsync(fn, [dep]), {
            initialProps: { dep: 1 },
        });

        await waitFor(() => expect(fn).toHaveBeenCalledTimes(1));

        rerender({ dep: 2 });

        await waitFor(() => expect(fn).toHaveBeenCalledTimes(2));
    });
});
