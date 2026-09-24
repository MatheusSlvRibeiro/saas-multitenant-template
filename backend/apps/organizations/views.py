from rest_framework import viewsets

from apps.core.mixins import TenantScopedViewSetMixin
from apps.core.permissions import IsOrgAdmin, IsOrgMember

from .models import Membership
from .serializers import MembershipSerializer


class MembershipViewSet(TenantScopedViewSetMixin, viewsets.ModelViewSet):
    """Membros da organização. Listar/ler: qualquer membro. Criar/editar/remover:
    admin ou owner."""

    serializer_class = MembershipSerializer
    queryset = Membership.objects.select_related('user', 'organization').all()

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsOrgAdmin()]
        return [IsOrgMember()]
