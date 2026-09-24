import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './Select';

const options = [
    { value: 'a', label: 'Opção A' },
    { value: 'b', label: 'Opção B' },
];

describe('Select', () => {
    it('shows a placeholder option when value is empty', () => {
        render(<Select id="fruit" label="Fruta" value="" onChange={vi.fn()} options={options} />);

        expect(screen.getByRole('option', { name: 'Selecione' })).toBeInTheDocument();
    });

    it('calls onChange with the selected value', async () => {
        const onChange = vi.fn();
        render(<Select id="fruit" label="Fruta" value="" onChange={onChange} options={options} />);

        await userEvent.selectOptions(screen.getByLabelText('Fruta'), 'b');

        expect(onChange).toHaveBeenCalledWith('b');
    });

    it('shows the error message', () => {
        render(
            <Select
                id="fruit"
                label="Fruta"
                value=""
                onChange={vi.fn()}
                options={options}
                error="Campo obrigatório"
            />,
        );

        expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    });

    it('shows a disabled placeholder when there are no options', () => {
        render(<Select id="fruit" label="Fruta" value="" onChange={vi.fn()} options={[]} />);

        expect(screen.getByRole('option', { name: 'Nenhuma opção' })).toBeDisabled();
    });
});
