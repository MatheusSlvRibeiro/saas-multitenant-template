import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService, type User } from '@/lib/services/AuthService/AuthService';
import type { LoginData } from '@/pages/LoginPage/_components/LoginForm/LoginForm.schema';

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginData) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // access_token httpOnly pode já existir de uma sessão anterior — /me/ é como a
        // SPA descobre "estou logado?" sem nunca ler o cookie diretamente.
        authService
            .getMe()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setIsLoading(false));
    }, []);

    const login = async (data: LoginData) => {
        await authService.login(data);
        setUser(await authService.getMe());
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, isAuthenticated: user !== null, isLoading, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
    }
    return context;
}
