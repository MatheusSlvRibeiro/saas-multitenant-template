# Configuração

## Variáveis de ambiente

| Variável | Lado | Build ou runtime | Obrigatória | Exemplo |
| --- | --- | --- | --- | --- |
| `DJANGO_SECRET_KEY` | backend | runtime | Sim | `django-insecure-...` (gere uma nova em produção, nunca reuse a de dev) |
| `DJANGO_DEBUG` | backend | runtime | Não (default `False`) | `False` |
| `DJANGO_ALLOWED_HOSTS` | backend | runtime | Sim em prod | `api.exemplo.com` |
| `DATABASE_URL` | backend | runtime | Sim | `postgres://user:pass@host:5432/db` |
| `CORS_ALLOWED_ORIGINS` | backend | runtime | Sim | `https://app.exemplo.com` |
| `COOKIE_DOMAIN` | backend | runtime | Não | `.exemplo.com` |
| `COOKIE_SAMESITE` | backend | runtime | Não (default `Lax`) | `Lax` |
| `CSRF_COOKIE_DOMAIN` | backend | runtime | Não | `.exemplo.com` |
| `CSRF_TRUSTED_ORIGINS` | backend | runtime | Sim | `https://app.exemplo.com` |
| `VITE_API_URL` | frontend | **build** | Sim | `https://api.exemplo.com` |

`DJANGO_SETTINGS_MODULE` não entra nessa lista porque não é configurado por ambiente — o
`Dockerfile` do backend já fixa `config.settings.production` na imagem de runtime; local, o
`manage.py` usa `config.settings.local` por padrão.

### `VITE_*` é público e é build-time

Toda variável prefixada `VITE_*` é embutida no bundle JS durante `vite build` — ela vira texto
plano no `dist/`, visível a qualquer um que abrir o DevTools. Duas consequências:

- **Nunca coloque segredo em `VITE_*`.** Não há como esconder isso do cliente.
- **Mudar o valor exige rebuild.** No Coolify, isso significa que `VITE_API_URL` precisa estar
  configurado como *build variable* do resource do frontend (não só *runtime environment
  variable*) — senão o valor gravado no bundle é o do build anterior.

## COOKIE_SAMESITE — Lax cobre o caso comum

`Lax` funciona sempre que frontend e API estão no mesmo "site" registrável (`app.exemplo.com` e
`api.exemplo.com` contam como o mesmo site). Use `None` só quando os dois vivem em domínios
registráveis genuinamente diferentes (`meuapp.com` e `minhaapi.io`) — nesse caso
`AUTH_COOKIE_SECURE` é obrigatoriamente `True` (browsers rejeitam `SameSite=None` sem `Secure`).

## Secrets do Forgejo (deploy)

Os workflows `.forgejo/workflows/deploy-{backend,frontend}.yml` disparam o deploy via webhook do
Coolify. Sem esses secrets cadastrados no repositório, o job de deploy roda e não faz nada — não
falha o workflow, então o template funciona em CI antes mesmo de existir infraestrutura.

| Secret | Descrição |
| --- | --- |
| `COOLIFY_URL` | URL base da instância Coolify (ex.: `https://coolify.exemplo.com`) |
| `COOLIFY_TOKEN` | Token de API do Coolify com permissão de deploy |
| `BACKEND_APP_UUID` | UUID do resource do backend no Coolify |
| `FRONTEND_APP_UUID` | UUID do resource do frontend no Coolify |

## Configurando os dois resources no Coolify

O backend e o frontend são **dois resources separados** no Coolify, apontando pro mesmo
repositório Git.

### Backend

- **Base Directory:** `/backend`
- **Build pack:** Dockerfile (usa `backend/Dockerfile`)
- **Porta:** `8000`
- **Variáveis de runtime:** todas as da tabela acima com lado `backend`
- **Banco:** aponte `DATABASE_URL` para o resource Postgres gerenciado do Coolify (fora deste
  repositório — ver `AGENTS.md`)

### Frontend

- **Base Directory:** `/frontend`
- **Build pack:** Dockerfile (usa `frontend/Dockerfile`)
- **Porta:** `80`
- **Variáveis de build:** `VITE_API_URL` (precisa estar disponível durante `docker build`, não só
  em runtime — ver seção acima)

### Depois de criar os dois resources

- **Desligue o Auto Deploy** dos dois resources — quem dispara o deploy é o workflow do Forgejo
  Actions (`deploy-backend.yml` / `deploy-frontend.yml`), não um push direto observado pelo
  Coolify. Deixar os dois ligados duplica o deploy.
- Pegue o UUID de cada resource (aparece na URL/configurações do resource) pra preencher
  `BACKEND_APP_UUID` / `FRONTEND_APP_UUID` nos secrets do Forgejo.
