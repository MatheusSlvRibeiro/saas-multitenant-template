# SaaS Multi-tenant Template

## Para que serve

Ponto de partida para todo projeto novo do tipo **SaaS multi-tenant com painel autenticado**:
Django + DRF no backend, React + Vite no frontend, autenticação JWT por cookie httpOnly,
isolamento de tenant por organização, e um CRUD de exemplo (membros de uma organização) que serve
de referência pra tudo que vier depois.

## Quando NÃO usar

- **Páginas públicas por tenant que precisam de SEO** (ex.: landing page própria por cliente,
  conteúdo indexável) — este template renderiza tudo client-side; use um template com Next.js.
- **Apenas uma landing page**, sem painel autenticado — um site estático é mais barato e simples.

## Stack

| Camada | Escolha |
| --- | --- |
| Backend | Django 5.2 + DRF, gerenciado com `uv` |
| Auth | JWT via cookie httpOnly (`djangorestframework-simplejwt`), CSRF explícito |
| Banco | PostgreSQL 16 |
| Frontend | React 18 + Vite + TypeScript strict |
| Estilo | SCSS Modules + BEM |
| Formulários | React Hook Form + zod |
| Tabelas | TanStack Table (v9 — veja a nota abaixo) |
| Tipos da API | gerados de `backend/schema.yml` via `openapi-typescript`, nunca escritos à mão |
| CI/CD | Forgejo Actions + deploy via webhook do Coolify |

A combinação e o porquê de cada peça estão documentados no skill `project-multitenant` do
`harness-engineering` (`skills/project-multitenant/SKILL.md`) — este template é a implementação
dele.

> **Nota de versão:** `@tanstack/react-table` está na v9, cuja API (`useTable` +
> `tableFeatures()` explícito) é diferente da v8 que a maioria dos exemplos por aí ainda mostra.
> Antes de mexer em `MembersTable`, leia os skills que o próprio pacote traz em
> `node_modules/@tanstack/table-core/skills/`.

## Criando um projeto a partir deste template (Forgejo)

1. No Forgejo, **Generate Repository** a partir deste template (não faça fork).
2. Clone o repositório novo.
3. Siga o checklist abaixo antes do primeiro commit.

## Checklist pós-criação

- [ ] Renomear o projeto e os slugs (`backend/pyproject.toml` → `name`, `frontend/package.json` →
      `name`, título em `frontend/index.html`)
- [ ] Gerar uma `DJANGO_SECRET_KEY` nova (nunca reaproveite a de outro projeto):
      `python -c "import secrets; print(secrets.token_urlsafe(50))"`
- [ ] Criar os dois resources no Coolify (backend e frontend) — ver `docs/configuracao.md`
- [ ] **Desligar Auto Deploy** nos dois resources do Coolify (quem dispara deploy é o workflow do
      Forgejo, não o Coolify observando o push)
- [ ] Cadastrar os secrets no Forgejo: `COOLIFY_URL`, `COOLIFY_TOKEN`, `BACKEND_APP_UUID`,
      `FRONTEND_APP_UUID`
- [ ] Ativar proteção da branch `main` (e `preview`): PR obrigatório, CI verde, 1 aprovação
- [ ] Instalar os hooks locais: `pre-commit install --hook-type pre-commit --hook-type commit-msg`

## Rodando localmente

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up
```

Backend em `http://localhost:8000`, frontend em `http://localhost:5173`. Sem passo manual além de
copiar os dois `.env.example`.

## Decisões do template

- **Hooks via pre-commit framework, não Husky.** Monorepo com backend Python e frontend Node
  disputariam `.git/hooks` se cada lado tentasse instalar seu próprio gerenciador. O
  `.pre-commit-config.yaml` na raiz roda Ruff (backend) e chama `pnpm --dir frontend exec
  lint-staged` (frontend) — um gerenciador só, pra todo o repositório.
- **Tenant resolvido pela URL** (`/api/orgs/<slug>/...`), não por subdomínio ou header — mais
  simples de testar e de rodar localmente sem configurar DNS. Ver `TenantScopedViewSetMixin` em
  `backend/apps/core/mixins.py` e `AGENTS.md`.
- **`SameSite=Lax` nos cookies de auth**, não `None`. Frontend e API vivem no mesmo site
  registrável (`app.x.com` / `api.x.com`) — `Lax` já protege contra o CSRF clássico de formulário
  cross-site sem precisar de `Secure` em todo ambiente. Troque pra `None` só se domínios
  registráveis genuinamente diferentes exigirem (ver `docs/configuracao.md`).
- **IDs são UUID em todo objeto**, inclusive o `User` (por isso um `AUTH_USER_MODEL` customizado em
  vez do `django.contrib.auth.User` padrão) — evita vazamento de volume/ordem de criação em APIs
  públicas e mantém um padrão único em vez de misturar `int` e `UUID` pelo sistema.
