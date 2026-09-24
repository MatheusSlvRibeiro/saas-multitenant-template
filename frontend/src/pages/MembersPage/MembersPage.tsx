import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { useAsync } from '@/lib/hooks/useAsync';
import {
    createMembershipService,
    type Membership,
} from '@/lib/services/MembershipService/MembershipService';
import { AddMemberForm } from './_components/AddMemberForm/AddMemberForm';
import type { AddMemberData } from './_components/AddMemberForm/AddMemberForm.schema';
import { EditRoleForm } from './_components/EditRoleForm/EditRoleForm';
import type { EditRoleData } from './_components/EditRoleForm/EditRoleForm.schema';
import { MembersTable } from './_components/MembersTable/MembersTable';
import styles from './MembersPage.module.scss';

const SEARCH_DEBOUNCE_MS = 300;

export function MembersPage() {
    const { orgSlug } = useParams<{ orgSlug: string }>();
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timeout);
    }, [search]);

    const service = useMemo(() => (orgSlug ? createMembershipService(orgSlug) : null), [orgSlug]);
    const ordering = sorting.map((sort) => (sort.desc ? `-${sort.id}` : sort.id)).join(',');

    const { data, error, isLoading } = useAsync(async () => {
        if (!service) return null;
        return service.list({
            page: pagination.pageIndex + 1,
            page_size: pagination.pageSize,
            search: debouncedSearch || undefined,
            ordering: ordering || undefined,
        });
    }, [service, pagination.pageIndex, pagination.pageSize, debouncedSearch, ordering, refreshKey]);

    if (!orgSlug || !service) {
        return <Navigate to="/orgs" replace />;
    }

    const handleAdd = async (formData: AddMemberData) => {
        await service.create({ user_id: Number(formData.userId), role: formData.role });
        setIsAdding(false);
        setRefreshKey((key) => key + 1);
    };

    const handleEditSubmit = async (formData: EditRoleData) => {
        if (!editingMembership) return;
        await service.update(editingMembership.id, { role: formData.role });
        setEditingMembership(null);
        setRefreshKey((key) => key + 1);
    };

    const handleRemove = async (membership: Membership) => {
        if (!window.confirm(`Remover ${membership.user.username} da organização?`)) return;
        await service.delete(membership.id);
        setRefreshKey((key) => key + 1);
    };

    return (
        <main className={styles.page}>
            <h1>Membros</h1>

            {!isAdding && !editingMembership && (
                <button type="button" onClick={() => setIsAdding(true)}>
                    Adicionar membro
                </button>
            )}
            {isAdding && <AddMemberForm onSubmit={handleAdd} onCancel={() => setIsAdding(false)} />}
            {editingMembership && (
                <EditRoleForm
                    membership={editingMembership}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setEditingMembership(null)}
                />
            )}

            {isLoading && <p>Carregando…</p>}
            {error !== null && <p role="alert">Não foi possível carregar os membros.</p>}

            {data && (
                <MembersTable
                    data={data.results}
                    rowCount={data.count}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    search={search}
                    onSearchChange={setSearch}
                    onEdit={setEditingMembership}
                    onRemove={handleRemove}
                />
            )}
        </main>
    );
}
