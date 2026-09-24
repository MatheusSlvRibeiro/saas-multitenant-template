import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/lib/api/client';
import { GenericService } from './GenericService';

interface Thing {
    id: number;
    name: string;
}

describe('GenericService', () => {
    let mock: MockAdapter;
    let service: GenericService<Thing>;

    beforeEach(() => {
        mock = new MockAdapter(api);
        service = new GenericService<Thing>('/api/orgs/acme/things/');
    });

    afterEach(() => {
        mock.restore();
    });

    it('list GETs the resource path and returns a paginated response', async () => {
        const page = { count: 1, next: null, previous: null, results: [{ id: 1, name: 'a' }] };
        mock.onGet('/api/orgs/acme/things/').reply(200, page);

        await expect(service.list()).resolves.toEqual(page);
    });

    it('getById GETs the resource with the id appended', async () => {
        mock.onGet('/api/orgs/acme/things/1/').reply(200, { id: 1, name: 'a' });

        await expect(service.getById(1)).resolves.toEqual({ id: 1, name: 'a' });
    });

    it('create POSTs to the resource path', async () => {
        mock.onPost('/api/orgs/acme/things/', { name: 'a' }).reply(201, { id: 1, name: 'a' });

        await expect(service.create({ name: 'a' })).resolves.toEqual({ id: 1, name: 'a' });
    });

    it('update PATCHes the resource with the id appended', async () => {
        mock.onPatch('/api/orgs/acme/things/1/', { name: 'b' }).reply(200, { id: 1, name: 'b' });

        await expect(service.update(1, { name: 'b' })).resolves.toEqual({ id: 1, name: 'b' });
    });

    it('delete DELETEs the resource with the id appended', async () => {
        mock.onDelete('/api/orgs/acme/things/1/').reply(204);

        await expect(service.delete(1)).resolves.toBeUndefined();
    });
});
