import pytest

from apps.accounts.tests.factories import UserFactory
from apps.organizations.models import Membership
from apps.organizations.tests.factories import MembershipFactory, OrganizationFactory


@pytest.mark.django_db
def test_member_can_list_own_organization_members(api_client):
    membership = MembershipFactory()
    other_membership = MembershipFactory(organization=membership.organization)
    api_client.force_authenticate(user=membership.user)

    response = api_client.get(f'/api/orgs/{membership.organization.slug}/members/')

    assert response.status_code == 200
    ids = {m['id'] for m in response.json()['results']}
    assert ids == {str(membership.id), str(other_membership.id)}


@pytest.mark.django_db
def test_unknown_org_slug_returns_404(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)

    response = api_client.get('/api/orgs/does-not-exist/members/')

    assert response.status_code == 404


@pytest.mark.django_db
def test_admin_can_add_a_member(api_client):
    admin_membership = MembershipFactory(role=Membership.Role.ADMIN)
    new_user = UserFactory()
    api_client.force_authenticate(user=admin_membership.user)

    response = api_client.post(
        f'/api/orgs/{admin_membership.organization.slug}/members/',
        {'user_id': str(new_user.id), 'role': Membership.Role.MEMBER},
    )

    assert response.status_code == 201
    created = Membership.objects.get(id=response.json()['id'])
    assert created.user_id == new_user.id
    assert created.organization_id == admin_membership.organization_id


@pytest.mark.django_db
def test_create_ignores_client_supplied_organization(api_client):
    admin_membership = MembershipFactory(role=Membership.Role.ADMIN)
    other_organization = OrganizationFactory()
    new_user = UserFactory()
    api_client.force_authenticate(user=admin_membership.user)

    response = api_client.post(
        f'/api/orgs/{admin_membership.organization.slug}/members/',
        {
            'user_id': str(new_user.id),
            'role': Membership.Role.MEMBER,
            'organization': str(other_organization.id),
        },
    )

    assert response.status_code == 201
    created = Membership.objects.get(id=response.json()['id'])
    assert created.organization_id == admin_membership.organization_id
    assert created.organization_id != other_organization.id


@pytest.mark.django_db
def test_plain_member_cannot_add_a_member(api_client):
    member_membership = MembershipFactory(role=Membership.Role.MEMBER)
    new_user = UserFactory()
    api_client.force_authenticate(user=member_membership.user)

    response = api_client.post(
        f'/api/orgs/{member_membership.organization.slug}/members/',
        {'user_id': str(new_user.id), 'role': Membership.Role.MEMBER},
    )

    assert response.status_code == 403


@pytest.mark.django_db
def test_admin_can_change_a_member_role(api_client):
    admin_membership = MembershipFactory(role=Membership.Role.ADMIN)
    target = MembershipFactory(
        organization=admin_membership.organization, role=Membership.Role.MEMBER
    )
    api_client.force_authenticate(user=admin_membership.user)

    response = api_client.patch(
        f'/api/orgs/{admin_membership.organization.slug}/members/{target.id}/',
        {'role': Membership.Role.ADMIN},
    )

    assert response.status_code == 200
    target.refresh_from_db()
    assert target.role == Membership.Role.ADMIN


@pytest.mark.django_db
def test_adding_the_same_user_twice_returns_400_not_500(api_client):
    admin_membership = MembershipFactory(role=Membership.Role.ADMIN)
    already_member = MembershipFactory(organization=admin_membership.organization)
    api_client.force_authenticate(user=admin_membership.user)

    response = api_client.post(
        f'/api/orgs/{admin_membership.organization.slug}/members/',
        {'user_id': str(already_member.user_id), 'role': Membership.Role.MEMBER},
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_search_filters_members_by_username(api_client):
    membership = MembershipFactory()
    api_client.force_authenticate(user=membership.user)
    MembershipFactory(organization=membership.organization, user__username='alice-carter')
    MembershipFactory(organization=membership.organization, user__username='bob-nguyen')

    response = api_client.get(
        f'/api/orgs/{membership.organization.slug}/members/', {'search': 'alice'}
    )

    usernames = {m['user']['username'] for m in response.json()['results']}
    assert usernames == {'alice-carter'}


@pytest.mark.django_db
def test_ordering_sorts_members_by_role(api_client):
    membership = MembershipFactory(role=Membership.Role.OWNER)
    api_client.force_authenticate(user=membership.user)
    MembershipFactory(organization=membership.organization, role=Membership.Role.ADMIN)
    MembershipFactory(organization=membership.organization, role=Membership.Role.MEMBER)

    response = api_client.get(
        f'/api/orgs/{membership.organization.slug}/members/', {'ordering': 'role'}
    )

    roles = [m['role'] for m in response.json()['results']]
    assert roles == sorted(roles)
