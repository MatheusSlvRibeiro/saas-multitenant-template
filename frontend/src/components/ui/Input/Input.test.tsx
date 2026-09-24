import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
    it('associates the label with the input via id', () => {
        render(<Input id="email" label="Email" />);

        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('forwards the ref to the underlying input element', () => {
        const ref = createRef<HTMLInputElement>();
        render(<Input id="email" label="Email" ref={ref} />);

        expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('shows the error message and marks the input as invalid', () => {
        render(<Input id="email" label="Email" invalid error="Email inválido" />);

        expect(screen.getByText('Email inválido')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    });

    it('calls onSuffixClick when the suffix button is clicked', async () => {
        const onSuffixClick = vi.fn();
        render(
            <Input
                id="password"
                label="Senha"
                suffix={<span>👁</span>}
                onSuffixClick={onSuffixClick}
            />,
        );

        await userEvent.click(screen.getByRole('button'));

        expect(onSuffixClick).toHaveBeenCalledOnce();
    });
});
