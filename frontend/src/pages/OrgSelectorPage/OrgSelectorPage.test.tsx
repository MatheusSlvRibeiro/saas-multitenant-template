import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api/client';
import { OrgSelectorPage } from './OrgSelectorPage';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => navigate };
});

describe('OrgSelectorPage', () => {
    let mock: MockAdapter;

    beforeEach(() => {
        mock = new MockAdapter(api);
    });

    afterEach(() => {
        mock.restore();
        navigate.mockClear();
    });

    it('lists the organizations the user belongs to', async () => {
        mock.onGet('/api/organizations/').reply(200, {
            count: 2,
            next: null,
            previous: null,
            results: [
                { id: '1', name: 'Acme', slug: 'acme' },
                { id: '2', name: 'Globex', slug: 'globex' },
            ],
        });

        render(
            <MemoryRouter>
                <OrgSelectorPage />
            </MemoryRouter>,
        );

        expect(await screen.findByText('Acme')).toBeInTheDocument();
        expect(screen.getByText('Globex')).toBeInTheDocument();
    });

    it('navigates to the members page when an organization is picked', async () => {
        mock.onGet('/api/organizations/').reply(200, {
            count: 1,
            next: null,
            previous: null,
            results: [{ id: '1', name: 'Acme', slug: 'acme' }],
        });

        render(
            <MemoryRouter>
                <OrgSelectorPage />
            </MemoryRouter>,
        );

        await userEvent.click(await screen.findByText('Acme'));

        expect(navigate).toHaveBeenCalledWith('/orgs/acme/members');
    });

    it('shows an empty state when the user has no organizations', async () => {
        mock.onGet('/api/organizations/').reply(200, {
            count: 0,
            next: null,
            previous: null,
            results: [],
        });

        render(
            <MemoryRouter>
                <OrgSelectorPage />
            </MemoryRouter>,
        );

        expect(
            await screen.findByText('Você ainda não é membro de nenhuma organização.'),
        ).toBeInTheDocument();
    });

    it('shows an error state when the request fails', async () => {
        mock.onGet('/api/organizations/').reply(500);

        render(
            <MemoryRouter>
                <OrgSelectorPage />
            </MemoryRouter>,
        );

        expect(await screen.findByRole('alert')).toBeInTheDocument();
    });
});
