import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/lib/api/client';
import { authService } from './AuthService';

describe('AuthService', () => {
    let mock: MockAdapter;

    beforeEach(() => {
        mock = new MockAdapter(api);
    });

    afterEach(() => {
        mock.restore();
    });

    it('primeCsrfCookie hits GET /api/auth/csrf/', async () => {
        mock.onGet('/api/auth/csrf/').reply(204);

        await expect(authService.primeCsrfCookie()).resolves.toBeUndefined();
    });

    it('login posts credentials to /api/auth/token/', async () => {
        mock.onPost('/api/auth/token/', { username: 'alice', password: 'secret' }).reply(200);

        await expect(
            authService.login({ username: 'alice', password: 'secret' }),
        ).resolves.toBeUndefined();
    });

    it('logout posts to /api/auth/logout/', async () => {
        mock.onPost('/api/auth/logout/').reply(204);

        await expect(authService.logout()).resolves.toBeUndefined();
    });

    it('getMe returns the authenticated user', async () => {
        mock.onGet('/api/auth/me/').reply(200, {
            id: 1,
            username: 'alice',
            email: 'alice@example.com',
        });

        await expect(authService.getMe()).resolves.toEqual({
            id: 1,
            username: 'alice',
            email: 'alice@example.com',
        });
    });
});
