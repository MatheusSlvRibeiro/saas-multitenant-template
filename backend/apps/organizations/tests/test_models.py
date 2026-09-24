import pytest
from django.db import IntegrityError

from apps.organizations.models import Membership
from apps.organizations.tests.factories import MembershipFactory, OrganizationFactory


@pytest.mark.django_db
def test_organization_str_is_its_name():
    organization = OrganizationFactory(name='Acme')

    assert str(organization) == 'Acme'


@pytest.mark.django_db
def test_membership_defaults_to_member_role():
    membership = MembershipFactory()

    assert membership.role == Membership.Role.MEMBER


@pytest.mark.django_db
def test_same_user_cannot_have_two_memberships_in_the_same_organization():
    membership = MembershipFactory()

    with pytest.raises(IntegrityError):
        MembershipFactory(organization=membership.organization, user=membership.user)
