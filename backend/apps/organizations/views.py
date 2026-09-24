from rest_framework import generics, viewsets
from rest_framework.filters import OrderingFilter, SearchFilter

from apps.core.mixins import TenantScopedViewSetMixin
from apps.core.permissions import IsOrgAdmin, IsOrgMember

from .models import Membership, Organization
from .serializers import MembershipSerializer, OrganizationSerializer


class MyOrganizationsView(generics.ListAPIView):
    """Organizações das quais o usuário autenticado é membro — é como a SPA monta o
    seletor de organização depois do login, antes de qualquer endpoint tenant-scoped
    fazer sentido (ainda não há slug pra resolver)."""

    serializer_class = OrganizationSerializer

    def get_queryset(self):
        return Organization.objects.filter(membership_set__user=self.request.user).distinct()


class MembershipViewSet(TenantScopedViewSetMixin, viewsets.ModelViewSet):
    """Membros da organização. Listar/ler: qualquer membro. Criar/editar/remover:
    admin ou owner."""

    serializer_class = MembershipSerializer
    queryset = Membership.objects.select_related('user', 'organization').all()
    filter_backends = [OrderingFilter, SearchFilter]
    ordering_fields = ['role', 'created_at', 'user__username', 'user__email']
    ordering = ['-created_at']
    search_fields = ['user__username', 'user__email']

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsOrgAdmin()]
        return [IsOrgMember()]
