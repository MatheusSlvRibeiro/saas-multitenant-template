import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AddMemberForm } from './AddMemberForm';

describe('AddMemberForm', () => {
    it('shows a validation error for a non-uuid user id', async () => {
        const onSubmit = vi.fn();
        render(<AddMemberForm onSubmit={onSubmit} onCancel={vi.fn()} />);

        await userEvent.type(screen.getByLabelText('ID do usuário'), 'abc');
        await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

        expect(await screen.findByText('Informe um ID de usuário válido')).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('submits the user id with the default role', async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        const userId = 'c4b2d3e5-6f7a-4b8c-9d0e-1f2a3b4c5d6e';
        render(<AddMemberForm onSubmit={onSubmit} onCancel={vi.fn()} />);

        await userEvent.type(screen.getByLabelText('ID do usuário'), userId);
        await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

        expect(onSubmit).toHaveBeenCalledWith({ userId, role: 'member' });
    });

    it('calls onCancel when Cancelar is clicked', async () => {
        const onCancel = vi.fn();
        render(<AddMemberForm onSubmit={vi.fn()} onCancel={onCancel} />);

        await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(onCancel).toHaveBeenCalledOnce();
    });
});
