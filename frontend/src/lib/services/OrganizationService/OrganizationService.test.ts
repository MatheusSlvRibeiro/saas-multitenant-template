import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/lib/api/client';
import { organizationService } from './OrganizationService';

describe('organizationService', () => {
    let mock: MockAdapter;

    beforeEach(() => {
        mock = new MockAdapter(api);
    });

    afterEach(() => {
        mock.restore();
    });

    it('list GETs /api/organizations/', async () => {
        const page = {
            count: 1,
            next: null,
            previous: null,
            results: [{ id: '1', name: 'Acme', slug: 'acme' }],
        };
        mock.onGet('/api/organizations/').reply(200, page);

        await expect(organizationService.list()).resolves.toEqual(page);
    });
});
