import {
    useTable,
    type OnChangeFn,
    type PaginationState,
    type SortingState,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/Input/Input';
import type { Membership } from '@/lib/services/MembershipService/MembershipService';
import { createMembersColumns, membersTableFeatures } from './MembersTable.columns';
import styles from './MembersTable.module.scss';

interface MembersTableProps {
    data: Membership[];
    rowCount: number;
    pagination: PaginationState;
    onPaginationChange: OnChangeFn<PaginationState>;
    sorting: SortingState;
    onSortingChange: OnChangeFn<SortingState>;
    search: string;
    onSearchChange: (value: string) => void;
    onEdit: (membership: Membership) => void;
    onRemove: (membership: Membership) => void;
}

export function MembersTable({
    data,
    rowCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    search,
    onSearchChange,
    onEdit,
    onRemove,
}: MembersTableProps) {
    const columns = createMembersColumns({ onEdit, onRemove });

    const table = useTable({
        features: membersTableFeatures,
        columns,
        data,
        rowCount,
        state: { pagination, sorting },
        onPaginationChange,
        onSortingChange,
        manualPagination: true,
        manualSorting: true,
    });

    return (
        <div className={styles.table}>
            <Input
                id="member-search"
                label="Buscar"
                placeholder="Usuário ou email"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
            />

            <table className={styles.table__grid}>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}
                                    className={
                                        header.column.getCanSort()
                                            ? styles['table__header--sortable']
                                            : undefined
                                    }
                                >
                                    {header.isPlaceholder ? null : (
                                        <table.FlexRender header={header} />
                                    )}
                                    {{ asc: ' ▲', desc: ' ▼' }[
                                        header.column.getIsSorted() as string
                                    ] ?? ''}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.length === 0 && (
                        <tr>
                            <td colSpan={columns.length}>Nenhum membro encontrado.</td>
                        </tr>
                    )}
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getAllCells().map((cell) => (
                                <td key={cell.id}>
                                    <table.FlexRender cell={cell} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className={styles.table__pagination}>
                <button
                    type="button"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Anterior
                </button>
                <span>
                    Página {pagination.pageIndex + 1} de {Math.max(table.getPageCount(), 1)}
                </span>
                <button
                    type="button"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Próxima
                </button>
            </div>
        </div>
    );
}
