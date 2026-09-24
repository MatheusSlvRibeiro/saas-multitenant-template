from django.http import Http404
from django.shortcuts import get_object_or_404


class TenantScopedViewSetMixin:
    """Toda ViewSet montada sob /api/orgs/<org_slug>/ herda isso — é o que torna a
    regra "todo dado de tenant filtra por organização" verificável, não só prosa.

    - Resolve a organização pelo slug da URL.
    - 404 (nunca 403) se o usuário não for membro — não revela que a organização existe
      pra quem não tem acesso a ela.
    - Filtra get_queryset() automaticamente pela organização.
    - Injeta a organização em perform_create() — o cliente nunca manda `organization`
      no body; se mandar, é ignorado.
    """

    def get_organization(self):
        if not hasattr(self, '_organization'):
            from apps.organizations.models import Membership, Organization

            organization = get_object_or_404(Organization, slug=self.kwargs['org_slug'])
            is_member = Membership.objects.filter(
                organization=organization, user=self.request.user
            ).exists()
            if not is_member:
                raise Http404
            self._organization = organization
        return self._organization

    def get_queryset(self):
        return super().get_queryset().filter(organization=self.get_organization())

    def perform_create(self, serializer):
        serializer.save(organization=self.get_organization())
