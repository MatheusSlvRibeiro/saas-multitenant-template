import { api } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';
import type { LoginData } from '@/pages/LoginPage/_components/LoginForm/LoginForm.schema';

export type User = components['schemas']['User'];

class AuthService {
    // Garante que o cookie csrftoken existe antes do primeiro POST — nada no fluxo
    // de login força o Django a emiti-lo (ver backend GET /api/auth/csrf/).
    async primeCsrfCookie(): Promise<void> {
        await api.get('/api/auth/csrf/');
    }

    async login(data: LoginData): Promise<void> {
        await api.post('/api/auth/token/', data);
    }

    async logout(): Promise<void> {
        await api.post('/api/auth/logout/');
    }

    async getMe(): Promise<User> {
        const response = await api.get<User>('/api/auth/me/');
        return response.data;
    }
}

export const authService = new AuthService();
