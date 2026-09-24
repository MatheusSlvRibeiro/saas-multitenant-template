import {
    createColumnHelper,
    rowPaginationFeature,
    rowSortingFeature,
    tableFeatures,
} from '@tanstack/react-table';
import type { Membership } from '@/lib/services/MembershipService/MembershipService';
import styles from './MembersTable.module.scss';

// @tanstack/react-table v9: recursos usados pela tabela precisam ser registrados
// explicitamente (nada vem "de brinde" como no v8). Paginação e ordenação aqui são
// manuais (o backend faz o trabalho), então só precisamos do state/API de cada
// feature — não dos row models (*RowModel), que processariam localmente.
export const membersTableFeatures = tableFeatures({
    rowSortingFeature,
    rowPaginationFeature,
});

const columnHelper = createColumnHelper<typeof membersTableFeatures, Membership>();

interface ColumnActions {
    onEdit: (membership: Membership) => void;
    onRemove: (membership: Membership) => void;
}

// id de cada coluna ordenável dobra como o valor mandado em `?ordering=` pro backend
// (ver MembershipViewSet.ordering_fields) — mantenha os dois sincronizados.
export function createMembersColumns({ onEdit, onRemove }: ColumnActions) {
    return columnHelper.columns([
        columnHelper.accessor((row) => row.user.username, {
            id: 'user__username',
            header: 'Usuário',
        }),
        columnHelper.accessor((row) => row.user.email, {
            id: 'user__email',
            header: 'Email',
        }),
        columnHelper.accessor('role', {
            id: 'role',
            header: 'Papel',
        }),
        columnHelper.accessor((row) => new Date(row.created_at).toLocaleDateString('pt-BR'), {
            id: 'created_at',
            header: 'Desde',
        }),
        columnHelper.display({
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({ row }) => (
                <div className={styles.table__actions}>
                    <button type="button" onClick={() => onEdit(row.original)}>
                        Editar
                    </button>
                    <button type="button" onClick={() => onRemove(row.original)}>
                        Remover
                    </button>
                </div>
            ),
        }),
    ]);
}
