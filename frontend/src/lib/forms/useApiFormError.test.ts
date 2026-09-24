import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useApiFormError } from './useApiFormError';

interface FormData {
    username: string;
    password: string;
}

function axiosError(status: number, data?: unknown) {
    return Object.assign(new Error('Request failed'), {
        isAxiosError: true,
        response: { status, data },
    });
}

describe('useApiFormError', () => {
    it('sets a root error with a custom message on 401', () => {
        const setError = vi.fn();
        const { result } = renderHook(() =>
            useApiFormError<FormData>(setError, { unauthorizedMessage: 'Credenciais inválidas' }),
        );

        result.current.applyApiError(axiosError(401));

        expect(setError).toHaveBeenCalledWith('root', { message: 'Credenciais inválidas' });
    });

    it('maps DRF field-validation errors to the matching form field', () => {
        const setError = vi.fn();
        const { result } = renderHook(() => useApiFormError<FormData>(setError));

        result.current.applyApiError(axiosError(400, { username: ['Este campo é obrigatório.'] }));

        expect(setError).toHaveBeenCalledWith('username', {
            message: 'Este campo é obrigatório.',
        });
    });

    it('maps detail and non_field_errors to the root field', () => {
        const setError = vi.fn();
        const { result } = renderHook(() => useApiFormError<FormData>(setError));

        result.current.applyApiError(axiosError(403, { detail: 'Não autorizado.' }));

        expect(setError).toHaveBeenCalledWith('root', { message: 'Não autorizado.' });
    });

    it('falls back to a generic message when the error shape is unrecognized', () => {
        const setError = vi.fn();
        const { result } = renderHook(() =>
            useApiFormError<FormData>(setError, { fallbackMessage: 'Tente novamente' }),
        );

        result.current.applyApiError(new Error('network error'));

        expect(setError).toHaveBeenCalledWith('root', { message: 'Tente novamente' });
    });

    it('wrapSubmit catches a rejected submit and applies the error, never throwing', async () => {
        const setError = vi.fn();
        const { result } = renderHook(() => useApiFormError<FormData>(setError));
        const submit = vi.fn().mockRejectedValue(axiosError(401));

        const handler = result.current.wrapSubmit(submit);
        await expect(handler({ username: 'a', password: 'b' })).resolves.toBeUndefined();

        expect(setError).toHaveBeenCalledWith('root', { message: 'Não autorizado' });
    });

    it('wrapSubmit does nothing extra when submit succeeds', async () => {
        const setError = vi.fn();
        const { result } = renderHook(() => useApiFormError<FormData>(setError));
        const submit = vi.fn().mockResolvedValue(undefined);

        await result.current.wrapSubmit(submit)({ username: 'a', password: 'b' });

        expect(setError).not.toHaveBeenCalled();
    });
});
