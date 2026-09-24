import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input/Input';
import { useAuth } from '@/context/authContext';
import { useApiFormError } from '@/lib/forms/useApiFormError';
import { authService } from '@/lib/services/AuthService/AuthService';
import { loginSchema, type LoginData } from './LoginForm.schema';
import styles from './LoginForm.module.scss';

interface LoginFormProps {
    onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
    const { login } = useAuth();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
    const { wrapSubmit } = useApiFormError<LoginData>(setError, {
        unauthorizedMessage: 'Usuário ou senha inválidos',
    });

    useEffect(() => {
        void authService.primeCsrfCookie();
    }, []);

    const onSubmit = wrapSubmit(async (data) => {
        await login(data);
        onSuccess();
    });

    return (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input
                id="username"
                label="Usuário"
                autoComplete="username"
                invalid={Boolean(errors.username)}
                error={errors.username?.message}
                {...register('username')}
            />

            <Input
                id="password"
                label="Senha"
                type="password"
                autoComplete="current-password"
                invalid={Boolean(errors.password)}
                error={errors.password?.message}
                {...register('password')}
            />

            {errors.root && (
                <span className={styles.form__error} role="alert">
                    {errors.root.message}
                </span>
            )}

            <button type="submit" disabled={isSubmitting}>
                Entrar
            </button>
        </form>
    );
}
