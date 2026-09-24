import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/context/authContext';
import { HealthPage } from '@/pages/HealthPage/HealthPage';
import { LoginPage } from '@/pages/LoginPage/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage/NotFoundPage';

export function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HealthPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
