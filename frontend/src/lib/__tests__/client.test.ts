import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { __setRedirectToLogin, api } from '@/lib/api/client';

describe('api client — single-flight refresh', () => {
    let mock: MockAdapter;

    beforeEach(() => {
        mock = new MockAdapter(api);
    });

    afterEach(() => {
        mock.restore();
    });

    it('refreshes exactly once for concurrent 401s and retries every original request', async () => {
        let protectedCallCount = 0;
        mock.onGet('/protected-a').reply(() =>
            protectedCallCount++ < 1 ? [401] : [200, { ok: 'a' }],
        );
        let secondCallCount = 0;
        mock.onGet('/protected-b').reply(() =>
            secondCallCount++ < 1 ? [401] : [200, { ok: 'b' }],
        );
        const refreshSpy = vi.fn((): [number] => [200]);
        mock.onPost('/api/auth/token/refresh/').reply(refreshSpy);

        const [resA, resB] = await Promise.all([api.get('/protected-a'), api.get('/protected-b')]);

        expect(resA.data).toEqual({ ok: 'a' });
        expect(resB.data).toEqual({ ok: 'b' });
        expect(refreshSpy).toHaveBeenCalledTimes(1);
    });

    it('redirects to login and stops retrying when the refresh call itself fails', async () => {
        const redirect = vi.fn();
        __setRedirectToLogin(redirect);
        mock.onGet('/protected-a').reply(401);
        mock.onPost('/api/auth/token/refresh/').reply(401);

        await expect(api.get('/protected-a')).rejects.toBeTruthy();

        expect(redirect).toHaveBeenCalledTimes(1);
    });

    it('does not retry a 401 from the login endpoint itself', async () => {
        mock.onPost('/api/auth/token/').reply(401);
        const refreshSpy = vi.fn((): [number] => [200]);
        mock.onPost('/api/auth/token/refresh/').reply(refreshSpy);

        await expect(api.post('/api/auth/token/', {})).rejects.toBeTruthy();

        expect(refreshSpy).not.toHaveBeenCalled();
    });
});
