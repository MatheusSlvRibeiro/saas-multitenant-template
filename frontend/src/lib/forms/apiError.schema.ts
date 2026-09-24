import { z } from 'zod';

/**
 * Shape de erro de validação do DRF: `{"field": ["mensagem"]}`, mais `detail` (erro
 * de auth/permissão) e `non_field_errors` (erro de `.validate()` sem campo específico).
 * `.catch({})` faz o parse nunca lançar — um payload inesperado vira "nenhum campo
 * mapeado", que cai no fallback genérico em vez de quebrar o form.
 */
export const apiErrorSchema = z
    .record(z.string(), z.union([z.array(z.string()), z.string()]))
    .catch({});

export type ApiErrorBody = z.infer<typeof apiErrorSchema>;
