"""Enforcement por teste, não por documentação: toda rota sob /api/orgs/ precisa
herdar TenantScopedViewSetMixin — adicionar uma view de tenant sem o mixin deve
quebrar este teste, não só a prosa do skill."""

from django.urls import get_resolver

from apps.core.mixins import TenantScopedViewSetMixin


def _iter_org_scoped_patterns(resolver, prefix=''):
    for pattern in resolver.url_patterns:
        current_prefix = prefix + str(pattern.pattern)
        if hasattr(pattern, 'url_patterns'):
            yield from _iter_org_scoped_patterns(pattern, current_prefix)
        elif 'orgs/' in current_prefix:
            yield current_prefix, pattern


def test_every_org_scoped_view_uses_tenant_scoped_mixin():
    org_scoped_patterns = list(_iter_org_scoped_patterns(get_resolver()))

    # Se isso disparar, o teste abaixo estaria checando uma lista vazia — um
    # falso-positivo silencioso é pior que nenhum teste.
    assert org_scoped_patterns, 'nenhuma rota sob /api/orgs/ foi encontrada'

    for path, pattern in org_scoped_patterns:
        view_class = getattr(pattern.callback, 'cls', None)
        assert view_class is not None, f'{path}: não é uma DRF class-based view'
        assert issubclass(view_class, TenantScopedViewSetMixin), (
            f'{path}: {view_class.__name__} não herda TenantScopedViewSetMixin'
        )
