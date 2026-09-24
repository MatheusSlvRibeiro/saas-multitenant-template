import { useNavigate } from 'react-router-dom';
import { useAsync } from '@/lib/hooks/useAsync';
import { organizationService } from '@/lib/services/OrganizationService/OrganizationService';
import styles from './OrgSelectorPage.module.scss';

export function OrgSelectorPage() {
    const navigate = useNavigate();
    const { data, error, isLoading } = useAsync(() => organizationService.list(), []);

    return (
        <main className={styles.selector}>
            <h1>Suas organizações</h1>

            {isLoading && <p>Carregando…</p>}
            {error !== null && <p role="alert">Não foi possível carregar suas organizações.</p>}
            {data && data.results.length === 0 && (
                <p>Você ainda não é membro de nenhuma organização.</p>
            )}

            {data && data.results.length > 0 && (
                <ul className={styles.selector__list}>
                    {data.results.map((organization) => (
                        <li key={organization.id}>
                            <button
                                type="button"
                                className={styles.selector__item}
                                onClick={() => navigate(`/orgs/${organization.slug}/members`)}
                            >
                                {organization.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
