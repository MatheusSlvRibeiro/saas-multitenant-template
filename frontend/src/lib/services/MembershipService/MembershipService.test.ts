import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/lib/api/client';
import { createMembershipService } from './MembershipService';

describe('createMembershipService', () => {
    let mock: MockAdapter;

    beforeEach(() => {
        mock = new MockAdapter(api);
    });

    afterEach(() => {
        mock.restore();
    });

    it('scopes every call to the given org slug', async () => {
        const service = createMembershipService('acme');
        mock.onGet('/api/orgs/acme/members/').reply(200, {
            count: 0,
            next: null,
            previous: null,
            results: [],
        });

        await service.list();

        expect(mock.history.get?.[0]?.url).toBe('/api/orgs/acme/members/');
    });

    it('create POSTs user_id and role to the org-scoped path', async () => {
        const service = createMembershipService('acme');
        mock.onPost('/api/orgs/acme/members/', { user_id: 7, role: 'member' }).reply(201, {
            id: '1',
            user: { id: 7, username: 'bob', email: 'bob@example.com' },
            role: 'member',
            created_at: '2026-01-01T00:00:00Z',
        });

        const created = await service.create({ user_id: 7, role: 'member' });

        expect(created.id).toBe('1');
    });

    it('update PATCHes only the role for a given membership', async () => {
        const service = createMembershipService('acme');
        mock.onPatch('/api/orgs/acme/members/1/', { role: 'admin' }).reply(200, {
            id: '1',
            user: { id: 7, username: 'bob', email: 'bob@example.com' },
            role: 'admin',
            created_at: '2026-01-01T00:00:00Z',
        });

        const updated = await service.update('1', { role: 'admin' });

        expect(updated.role).toBe('admin');
    });
});
