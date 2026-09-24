import { z } from 'zod';

// Sem endpoint de busca de usuário ainda (fora do escopo deste archetype), o convite
// é por ID direto — um próximo passo natural seria trocar isso por um autocomplete
// que resolve email -> id. userId é o UUID do User (ver apps/accounts/models.py).
export const addMemberSchema = z.object({
    userId: z.string().min(1, 'Informe o ID do usuário').uuid('Informe um ID de usuário válido'),
    role: z.enum(['owner', 'admin', 'member']),
});

export type AddMemberData = z.infer<typeof addMemberSchema>;
