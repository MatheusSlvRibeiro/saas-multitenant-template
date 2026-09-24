import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Membership } from '@/lib/services/MembershipService/MembershipService';
import { EditRoleForm } from './EditRoleForm';

const membership: Membership = {
    id: 'a2f1e6b2-2b3a-4a5a-9c1a-8f1e0d2b3c4d',
    user: {
        id: 'f3a1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
        username: 'alice',
        email: 'alice@example.com',
    },
    user_id: 'f3a1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    role: 'member',
    created_at: '2026-01-01T00:00:00Z',
};

describe('EditRoleForm', () => {
    it('pre-fills the select with the membership current role', () => {
        render(<EditRoleForm membership={membership} onSubmit={vi.fn()} onCancel={vi.fn()} />);

        expect(screen.getByLabelText('Papel')).toHaveValue('member');
    });

    it('submits the newly selected role', async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        render(<EditRoleForm membership={membership} onSubmit={onSubmit} onCancel={vi.fn()} />);

        await userEvent.selectOptions(screen.getByLabelText('Papel'), 'admin');
        await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

        expect(onSubmit).toHaveBeenCalledWith({ role: 'admin' });
    });

    it('shows the target member username', () => {
        render(<EditRoleForm membership={membership} onSubmit={vi.fn()} onCancel={vi.fn()} />);

        expect(screen.getByText('alice')).toBeInTheDocument();
    });
});
