from rest_framework.permissions import BasePermission


class HasOrgRole(BasePermission):
    """Base pra permission por role — a view precisa herdar TenantScopedViewSetMixin
    (usa view.get_organization()). Subclasse e declare `allowed_roles`."""

    allowed_roles: tuple[str, ...] = ()

    def has_permission(self, request, view):
        from apps.organizations.models import Membership

        organization = view.get_organization()
        membership = Membership.objects.filter(organization=organization, user=request.user).first()
        return membership is not None and membership.role in self.allowed_roles


class IsOrgMember(HasOrgRole):
    allowed_roles = ('owner', 'admin', 'member')


class IsOrgAdmin(HasOrgRole):
    allowed_roles = ('owner', 'admin')


class IsOrgOwner(HasOrgRole):
    allowed_roles = ('owner',)
