import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/context/authContext';
import { LoginPage } from '@/pages/LoginPage/LoginPage';
import { MembersPage } from '@/pages/MembersPage/MembersPage';
import { NotFoundPage } from '@/pages/NotFoundPage/NotFoundPage';
import { OrgSelectorPage } from '@/pages/OrgSelectorPage/OrgSelectorPage';

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
                <Route path="/" element={<Navigate to="/orgs" replace />} />
                <Route path="/orgs" element={<OrgSelectorPage />} />
                <Route path="/orgs/:orgSlug/members" element={<MembersPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
