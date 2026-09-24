import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Membership } from '@/lib/services/MembershipService/MembershipService';
import { MembersTable } from './MembersTable';

const members: Membership[] = [
    {
        id: 'a2f1e6b2-2b3a-4a5a-9c1a-8f1e0d2b3c4d',
        user: {
            id: 'f3a1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
            username: 'alice',
            email: 'alice@example.com',
        },
        user_id: 'f3a1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
        role: 'admin',
        created_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'b3f2e7c3-3c4b-4b6b-8d2b-9f2e1e3c4d5e',
        user: {
            id: 'c4b2d3e5-6f7a-4b8c-9d0e-1f2a3b4c5d6e',
            username: 'bob',
            email: 'bob@example.com',
        },
        user_id: 'c4b2d3e5-6f7a-4b8c-9d0e-1f2a3b4c5d6e',
        role: 'member',
        created_at: '2026-02-01T00:00:00Z',
    },
];

function renderTable(overrides: Partial<React.ComponentProps<typeof MembersTable>> = {}) {
    return render(
        <MembersTable
            data={members}
            rowCount={23}
            pagination={{ pageIndex: 0, pageSize: 20 }}
            onPaginationChange={vi.fn()}
            sorting={[]}
            onSortingChange={vi.fn()}
            search=""
            onSearchChange={vi.fn()}
            onEdit={vi.fn()}
            onRemove={vi.fn()}
            {...overrides}
        />,
    );
}

describe('MembersTable', () => {
    it('renders a row per member', () => {
        renderTable();

        expect(screen.getByText('alice')).toBeInTheDocument();
        expect(screen.getByText('bob')).toBeInTheDocument();
    });

    it('shows an empty state with no members', () => {
        renderTable({ data: [] });

        expect(screen.getByText('Nenhum membro encontrado.')).toBeInTheDocument();
    });

    it('calls onEdit with the row data when Editar is clicked', async () => {
        const onEdit = vi.fn();
        renderTable({ onEdit });

        await userEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0]!);

        expect(onEdit).toHaveBeenCalledWith(members[0]);
    });

    it('calls onRemove with the row data when Remover is clicked', async () => {
        const onRemove = vi.fn();
        renderTable({ onRemove });

        await userEvent.click(screen.getAllByRole('button', { name: 'Remover' })[1]!);

        expect(onRemove).toHaveBeenCalledWith(members[1]);
    });

    it('toggles sorting when a sortable header is clicked', async () => {
        const onSortingChange = vi.fn();
        renderTable({ onSortingChange });

        await userEvent.click(screen.getByText('Papel'));

        expect(onSortingChange).toHaveBeenCalled();
    });

    it('calls onSearchChange as the user types in the search field', async () => {
        const onSearchChange = vi.fn();
        renderTable({ onSearchChange });

        await userEvent.type(screen.getByLabelText('Buscar'), 'a');

        expect(onSearchChange).toHaveBeenCalledWith('a');
    });

    it('disables "Anterior" on the first page', () => {
        renderTable({ pagination: { pageIndex: 0, pageSize: 20 } });

        expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    });
});
