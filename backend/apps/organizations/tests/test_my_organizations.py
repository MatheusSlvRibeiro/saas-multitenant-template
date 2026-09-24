import pytest

from apps.accounts.tests.factories import UserFactory
from apps.organizations.tests.factories import MembershipFactory, OrganizationFactory


@pytest.mark.django_db
def test_lists_only_organizations_the_user_belongs_to(api_client):
    user = UserFactory()
    my_org = OrganizationFactory()
    MembershipFactory(organization=my_org, user=user)
    other_org = OrganizationFactory()
    MembershipFactory(organization=other_org)  # outro usuário, não deve aparecer

    api_client.force_authenticate(user=user)
    response = api_client.get('/api/organizations/')

    assert response.status_code == 200
    slugs = {org['slug'] for org in response.json()['results']}
    assert slugs == {my_org.slug}


@pytest.mark.django_db
def test_lists_every_organization_the_user_belongs_to_when_there_are_several(api_client):
    user = UserFactory()
    org_a = OrganizationFactory()
    org_b = OrganizationFactory()
    MembershipFactory(organization=org_a, user=user)
    MembershipFactory(organization=org_b, user=user)

    api_client.force_authenticate(user=user)
    response = api_client.get('/api/organizations/')

    slugs = {org['slug'] for org in response.json()['results']}
    assert slugs == {org_a.slug, org_b.slug}


@pytest.mark.django_db
def test_requires_authentication(api_client):
    response = api_client.get('/api/organizations/')

    assert response.status_code == 401
