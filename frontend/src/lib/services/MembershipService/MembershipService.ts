import { GenericService } from '@/lib/services/GenericService/GenericService';
import type { components } from '@/lib/api/schema';

export type Membership = components['schemas']['Membership'];
export type MembershipRole = components['schemas']['RoleEnum'];

export interface MembershipCreatePayload {
    user_id: number;
    role: MembershipRole;
}

export interface MembershipUpdatePayload {
    role: MembershipRole;
}

// O path do recurso depende do slug da org selecionada, então isso é uma factory,
// não uma instância única como AuthService/OrganizationService.
export function createMembershipService(orgSlug: string) {
    return new GenericService<Membership, MembershipCreatePayload, MembershipUpdatePayload>(
        `/api/orgs/${orgSlug}/members/`,
    );
}
