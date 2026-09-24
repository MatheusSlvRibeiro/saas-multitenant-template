import axios from 'axios';

// Cookie httpOnly em vez de header Bearer: o frontend nunca lê o token, só ecoa o
// cookie CSRF não-httpOnly de volta no header (ver backend/jwt-cookie-auth do harness).
// O interceptor de refresh single-flight chega na Fase 2 junto com o fluxo de login.
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
