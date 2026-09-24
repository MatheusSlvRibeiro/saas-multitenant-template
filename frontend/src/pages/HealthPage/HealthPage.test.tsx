import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api/client';
import { HealthPage } from './HealthPage';

vi.mock('@/lib/api/client', () => ({
    api: { get: vi.fn() },
}));

describe('HealthPage', () => {
    it('shows ok once the health check resolves', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: { status: 'ok' } });

        render(<HealthPage />);

        expect(await screen.findByText('API status: ok')).toBeInTheDocument();
    });

    it('shows error when the health check fails', async () => {
        vi.mocked(api.get).mockRejectedValue(new Error('network error'));

        render(<HealthPage />);

        expect(await screen.findByText('API status: error')).toBeInTheDocument();
    });
});
