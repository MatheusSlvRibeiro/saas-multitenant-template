import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TextArea } from './TextArea';

describe('TextArea', () => {
    it('shows a character counter when maxLength is set', () => {
        render(<TextArea id="bio" label="Bio" maxLength={20} />);

        expect(screen.getByText('0/20')).toBeInTheDocument();
    });

    it('updates the counter as the user types', async () => {
        render(<TextArea id="bio" label="Bio" maxLength={20} />);

        await userEvent.type(screen.getByLabelText('Bio'), 'hello');

        expect(screen.getByText('5/20')).toBeInTheDocument();
    });

    it('flags the counter once the limit is reached', async () => {
        render(<TextArea id="bio" label="Bio" maxLength={5} />);

        await userEvent.type(screen.getByLabelText('Bio'), 'hello');

        expect(screen.getByText('5/5').className).toContain('limit');
    });

    it('does not render a counter when maxLength is not set', () => {
        render(<TextArea id="bio" label="Bio" />);

        expect(screen.queryByText(/\/\d+/)).not.toBeInTheDocument();
    });

    it('shows the error message', () => {
        render(<TextArea id="bio" label="Bio" error="Campo obrigatório" />);

        expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    });
});
