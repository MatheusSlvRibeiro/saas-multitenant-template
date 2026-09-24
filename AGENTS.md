# AGENTS.md

- **Isolamento de tenant é obrigatório.** Toda ViewSet sob `/api/orgs/<slug>/` herda
  `TenantScopedViewSetMixin` (`backend/apps/core/mixins.py`) — resolve a org pelo slug, 404 pra
  quem não é membro (nunca 403), filtra `get_queryset()` e injeta `organization` em
  `perform_create()`. Verificado por teste (`backend/tests/test_tenant_enforcement.py`), não só
  por convenção — uma view sem o mixin quebra o CI.

- **Tipos de API no frontend são gerados, nunca escritos à mão.**
  `frontend/src/lib/api/schema.d.ts` vem de `backend/schema.yml` via `openapi-typescript`. Depois
  de mudar view/serializer, regenere os dois:
  ```
  cd backend && uv run manage.py spectacular --file schema.yml
  cd frontend && pnpm run generate:types
  ```
  O CI (job `contrato`) falha se algum dos dois divergir do que está commitado.

- **Branch e PR:** crie a partir de `preview`, nunca de `main` (`feat/*`, `fix/*`, `chore/*`,
  `refactor/*`, `test/*`, `docs/*`). PR `feat/* → preview`; release é `preview → main`. Commits em
  inglês, Conventional Commits (`feat(scope): description`).

- **Apps Django ficam flat** (`models.py`, `serializers.py`, `views.py`, `urls.py`,
  `services.py`) até crescerem de verdade. Quebre em subpacotes (`models/`, `api/`, `utils/`) só
  quando um arquivo passar de ~300 linhas ou tiver serializers/views claramente por recurso —
  não antecipe essa estrutura num app com um model e uma view.

- **Testes e lint:**
  ```
  cd backend && uv run pytest && uv run ruff check . && uv run ruff format --check .
  cd frontend && pnpm run test && pnpm run lint && pnpm run format:check
  ```
