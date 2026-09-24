import { useEffect, useState, type DependencyList } from 'react';

interface AsyncState<T> {
    data: T | null;
    error: unknown;
    isLoading: boolean;
}

/**
 * Dispara `fn` em mount e sempre que `deps` mudar (mesmo contrato de `useEffect`),
 * ignorando a resposta se o componente desmontar/os deps mudarem antes dela chegar —
 * repetido o bastante entre páginas (seletor de org, listagem de membros) pra valer
 * a pena centralizar em vez de duplicar o try/state/cancelled em cada uma.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList): AsyncState<T> {
    const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, isLoading: true });

    useEffect(() => {
        let cancelled = false;
        // Sincroniza o estado local com um refetch (deps mudou) — sem lib de fetching,
        // é a única forma de o consumidor saber que uma nova busca começou.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState((previous) => ({ ...previous, isLoading: true }));

        fn()
            .then((data) => {
                if (!cancelled) setState({ data, error: null, isLoading: false });
            })
            .catch((error: unknown) => {
                if (!cancelled) setState({ data: null, error, isLoading: false });
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- deps é o contrato, não fn
    }, deps);

    return state;
}
