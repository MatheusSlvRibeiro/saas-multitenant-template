import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import * as authContext from '@/context/authContext';
import { authService } from '@/lib/services/AuthService/AuthService';
import { LoginForm } from './LoginForm';
import type { LoginData } from './LoginForm.schema';

vi.mock('@/context/authContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('@/lib/services/AuthService/AuthService', () => ({
    authService: { primeCsrfCookie: vi.fn() },
}));

function mockUseAuth(login: (data: LoginData) => Promise<void>) {
    vi.mocked(authContext.useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login,
        logout: vi.fn(),
    });
}

describe('LoginForm', () => {
    it('shows validation errors and never calls login with an empty form', async () => {
        const login = vi.fn();
        mockUseAuth(login);
        const onSuccess = vi.fn();
        render(<LoginForm onSuccess={onSuccess} />);

        await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

        expect(await screen.findByText('Informe seu usuário')).toBeInTheDocument();
        expect(screen.getByText('Informe sua senha')).toBeInTheDocument();
        expect(login).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('calls onSuccess after a valid submit', async () => {
        const login = vi.fn().mockResolvedValue(undefined);
        mockUseAuth(login);
        const onSuccess = vi.fn();
        render(<LoginForm onSuccess={onSuccess} />);

        await userEvent.type(screen.getByLabelText('Usuário'), 'alice');
        await userEvent.type(screen.getByLabelText('Senha'), 'strong-pass-123');
        await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

        expect(onSuccess).toHaveBeenCalledOnce();
    });

    it('shows a field-level error when the server rejects the credentials', async () => {
        const axiosError = Object.assign(new Error('Request failed'), {
            isAxiosError: true,
            response: { status: 401 },
        });
        const login = vi.fn().mockRejectedValue(axiosError);
        mockUseAuth(login);
        render(<LoginForm onSuccess={vi.fn()} />);

        await userEvent.type(screen.getByLabelText('Usuário'), 'alice');
        await userEvent.type(screen.getByLabelText('Senha'), 'wrong-password');
        await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

        expect(await screen.findByText('Usuário ou senha inválidos')).toBeInTheDocument();
    });

    it('primes the CSRF cookie on mount', () => {
        mockUseAuth(vi.fn());
        render(<LoginForm onSuccess={vi.fn()} />);

        expect(authService.primeCsrfCookie).toHaveBeenCalledOnce();
    });
});
