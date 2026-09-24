import { z } from 'zod';

// Sem endpoint de busca de usuário ainda (fora do escopo deste archetype), o convite
// é por ID direto — um próximo passo natural seria trocar isso por um autocomplete
// que resolve email -> id. userId fica string aqui (o input HTML já produz string) —
// a conversão pra number acontece no submit, não no schema, pra não divergir o tipo
// de input do tipo de output do zod (z.coerce faria isso e complicaria a tipagem do RHF).
export const addMemberSchema = z.object({
    userId: z
        .string()
        .min(1, 'Informe o ID do usuário')
        .regex(/^\d+$/, 'Informe um ID de usuário válido'),
    role: z.enum(['owner', 'admin', 'member']),
});

export type AddMemberData = z.infer<typeof addMemberSchema>;
