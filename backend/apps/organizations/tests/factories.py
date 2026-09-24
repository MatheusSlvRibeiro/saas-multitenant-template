import factory

from apps.accounts.tests.factories import UserFactory
from apps.organizations.models import Membership, Organization


class OrganizationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Organization

    name = factory.Sequence(lambda n: f'Org {n}')
    slug = factory.Sequence(lambda n: f'org-{n}')


class MembershipFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Membership

    organization = factory.SubFactory(OrganizationFactory)
    user = factory.SubFactory(UserFactory)
    role = Membership.Role.MEMBER
