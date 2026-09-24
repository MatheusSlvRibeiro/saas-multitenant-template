import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

type HealthStatus = 'checking' | 'ok' | 'error';

export function HealthPage() {
  const [status, setStatus] = useState<HealthStatus>('checking');

  useEffect(() => {
    api
      .get('/api/health/')
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'));
  }, []);

  return <p>API status: {status}</p>;
}
