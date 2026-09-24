import { isAxiosError } from 'axios';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { apiErrorSchema } from './apiError.schema';

interface UseApiFormErrorOptions {
    /** Mensagem pra 401 — em geral "credenciais inválidas", específica por form. */
    unauthorizedMessage?: string;
    fallbackMessage?: string;
}

const ROOT_ERROR_KEYS = new Set(['detail', 'non_field_errors']);

/**
 * Centraliza "erro de API vira erro de campo do form" — o componente nunca decide
 * isso sozinho. O corpo do erro é `unknown` até passar por `apiErrorSchema`, igual a
 * qualquer outra resposta de API (ver frontend/typescript do harness).
 */
export function useApiFormError<TFieldValues extends FieldValues>(
    setError: UseFormSetError<TFieldValues>,
    options: UseApiFormErrorOptions = {},
) {
    const applyApiError = (error: unknown): void => {
        if (isAxiosError(error) && error.response?.status === 401) {
            setError('root' as Path<TFieldValues>, {
                message: options.unauthorizedMessage ?? 'Não autorizado',
            });
            return;
        }

        if (isAxiosError(error) && error.response?.data) {
            const fields = apiErrorSchema.parse(error.response.data);
            let appliedFieldError = false;

            for (const [field, messages] of Object.entries(fields)) {
                const message = Array.isArray(messages) ? messages[0] : messages;
                if (!message) continue;

                const target = ROOT_ERROR_KEYS.has(field) ? 'root' : field;
                setError(target as Path<TFieldValues>, { message });
                appliedFieldError = true;
            }

            if (appliedFieldError) return;
        }

        setError('root' as Path<TFieldValues>, {
            message: options.fallbackMessage ?? 'Algo deu errado. Tente novamente.',
        });
    };

    const wrapSubmit = (submit: (data: TFieldValues) => Promise<void>) => {
        return async (data: TFieldValues) => {
            try {
                await submit(data);
            } catch (error) {
                applyApiError(error);
            }
        };
    };

    return { applyApiError, wrapSubmit };
}
