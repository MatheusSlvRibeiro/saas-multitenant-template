import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Membership } from '@/lib/services/MembershipService/MembershipService';
import { EditRoleForm } from './EditRoleForm';

const membership: Membership = {
    id: '1',
    user: { id: 1, username: 'alice', email: 'alice@example.com' },
    user_id: 1,
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
