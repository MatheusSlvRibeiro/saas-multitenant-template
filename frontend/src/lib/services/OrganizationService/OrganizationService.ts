import { GenericService } from '@/lib/services/GenericService/GenericService';
import type { components } from '@/lib/api/schema';

export type Organization = components['schemas']['Organization'];

// Só list() é usado por enquanto (seletor de organização pós-login) — criar
// organização é fluxo de onboarding, fora do escopo deste archetype por ora.
export const organizationService = new GenericService<Organization>('/api/organizations/');
