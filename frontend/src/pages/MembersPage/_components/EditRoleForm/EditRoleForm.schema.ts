import { z } from 'zod';

export const editRoleSchema = z.object({
    role: z.enum(['owner', 'admin', 'member']),
});

export type EditRoleData = z.infer<typeof editRoleSchema>;
