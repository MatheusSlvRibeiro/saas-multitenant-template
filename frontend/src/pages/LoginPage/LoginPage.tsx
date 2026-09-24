import { useNavigate } from 'react-router-dom';
import { LoginForm } from './_components/LoginForm/LoginForm';

export function LoginPage() {
    const navigate = useNavigate();

    return (
        <main>
            <h1>Entrar</h1>
            <LoginForm onSuccess={() => navigate('/')} />
        </main>
    );
}
