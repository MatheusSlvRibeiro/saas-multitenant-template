FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

COPY . .
RUN uv sync --frozen --no-dev

# collectstatic needs settings importable, but not a live DATABASE_URL/SECRET_KEY —
# both come from placeholders here and are overridden by real env vars at runtime.
# `.venv/bin/python` directly, not `uv run`: the latter re-syncs the lockfile including
# the dev group (ruff, pytest...), which would leak dev tooling into the runtime image.
RUN DJANGO_SETTINGS_MODULE=config.settings.production \
    DJANGO_SECRET_KEY=build-time-placeholder \
    DATABASE_URL=sqlite:///build.db \
    .venv/bin/python manage.py collectstatic --noinput

FROM python:3.12-slim-bookworm AS runtime

RUN groupadd --system app && useradd --system --gid app --create-home app

WORKDIR /app
RUN chown app:app /app
COPY --from=builder --chown=app:app /app /app

USER app
ENV PATH="/app/.venv/bin:$PATH" DJANGO_SETTINGS_MODULE=config.settings.production

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:8000"]
