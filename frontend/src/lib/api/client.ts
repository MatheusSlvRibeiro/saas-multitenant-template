import axios from 'axios';

// Cookie httpOnly em vez de header Bearer: o frontend nunca lê o token, só ecoa o
// cookie CSRF não-httpOnly de volta no header (ver backend/jwt-cookie-auth do harness).
function getCsrfCookie(): string {
    return (
        document.cookie
            .split('; ')
            .find((row) => row.startsWith('csrftoken='))
            ?.split('=')[1] ?? ''
    );
}

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    if (['post', 'put', 'patch', 'delete'].includes(config.method ?? '')) {
        config.headers.set('X-CSRFToken', getCsrfCookie());
    }
    return config;
});

const REFRESH_URL = '/api/auth/token/refresh/';

// Único ponto de "estou re-autenticando agora" do módulo — todo 401 concorrente
// aguarda essa mesma promise em vez de disparar seu próprio refresh, senão N
// requests em paralelo viram N chamadas de refresh (e N rotações de cookie
// competindo entre si).
let refreshPromise: Promise<void> | null = null;

function refreshAccessToken(): Promise<void> {
    refreshPromise ??= api
        .post(REFRESH_URL)
        .then(() => undefined)
        .finally(() => {
            refreshPromise = null;
        });
    return refreshPromise;
}

// Sobrescrito nos testes — em produção é um redirect de verdade, que o jsdom não
// sabe navegar.
export let redirectToLogin = () => {
    window.location.assign('/login');
};

export function __setRedirectToLogin(fn: typeof redirectToLogin) {
    redirectToLogin = fn;
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        // token/ (login) e token/refresh/ nunca disparam um refresh-e-repete: um 401 no
        // login é credencial errada, não sessão expirada; e um 401 no próprio refresh
        // recursaria de volta pra este interceptor.
        const isExemptFromRetry =
            original?.url?.endsWith('/api/auth/token/') || original?.url === REFRESH_URL;

        if (error.response?.status !== 401 || !original || original._retry || isExemptFromRetry) {
            return Promise.reject(error);
        }

        original._retry = true;

        try {
            await refreshAccessToken();
            return api(original);
        } catch (refreshError) {
            redirectToLogin();
            return Promise.reject(refreshError);
        }
    },
);
