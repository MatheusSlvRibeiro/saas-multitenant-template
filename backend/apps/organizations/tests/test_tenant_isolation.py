import pytest

from apps.accounts.tests.factories import UserFactory
from apps.organizations.models import Membership
from apps.organizations.tests.factories import MembershipFactory, OrganizationFactory


@pytest.fixture
def two_tenants():
    """Dois tenants isolados, cada um com um membro admin — o cenário mínimo pra
    provar que dado de um nunca vaza pro outro."""
    org_a = OrganizationFactory()
    org_b = OrganizationFactory()
    membership_a = MembershipFactory(organization=org_a, role=Membership.Role.ADMIN)
    membership_b = MembershipFactory(organization=org_b, role=Membership.Role.ADMIN)
    return org_a, org_b, membership_a, membership_b


@pytest.mark.django_db
def test_non_member_gets_404_not_403(api_client, two_tenants):
    org_a, org_b, membership_a, membership_b = two_tenants
    api_client.force_authenticate(user=membership_a.user)

    response = api_client.get(f'/api/orgs/{org_b.slug}/members/')

    # 403 revelaria que a organização existe pra alguém sem acesso a ela.
    assert response.status_code == 404


@pytest.mark.django_db
def test_listing_tenant_a_never_includes_tenant_b_data(api_client, two_tenants):
    org_a, org_b, membership_a, membership_b = two_tenants
    api_client.force_authenticate(user=membership_a.user)

    response = api_client.get(f'/api/orgs/{org_a.slug}/members/')

    assert response.status_code == 200
    ids = {m['id'] for m in response.json()['results']}
    assert ids == {str(membership_a.id)}
    assert str(membership_b.id) not in ids


@pytest.mark.django_db
def test_member_of_tenant_a_cannot_read_update_or_delete_tenant_b_data(api_client, two_tenants):
    org_a, org_b, membership_a, membership_b = two_tenants
    api_client.force_authenticate(user=membership_a.user)

    # slug válido (org_a, da qual membership_a É membro) mas o PK no path pertence ao
    # tenant B — sem filtro por organização no get_queryset(), isso vazaria dado entre
    # tenants por adivinhação de UUID.
    detail_url = f'/api/orgs/{org_a.slug}/members/{membership_b.id}/'

    assert api_client.get(detail_url).status_code == 404
    assert api_client.patch(detail_url, {'role': Membership.Role.OWNER}).status_code == 404
    assert api_client.delete(detail_url).status_code == 404

    membership_b.refresh_from_db()
    assert membership_b.role == Membership.Role.ADMIN


@pytest.mark.django_db
def test_create_always_uses_the_organization_from_the_url_slug(api_client, two_tenants):
    org_a, org_b, membership_a, membership_b = two_tenants
    api_client.force_authenticate(user=membership_a.user)

    new_user = UserFactory()
    response = api_client.post(
        f'/api/orgs/{org_a.slug}/members/',
        {
            'user_id': str(new_user.id),
            'role': Membership.Role.MEMBER,
            'organization': str(org_b.id),
        },
    )

    assert response.status_code == 201
    created = Membership.objects.get(id=response.json()['id'])
    assert created.organization_id == org_a.id
