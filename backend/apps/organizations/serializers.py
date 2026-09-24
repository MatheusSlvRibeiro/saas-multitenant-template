from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.accounts.serializers import UserSerializer

from .models import Membership, Organization

User = get_user_model()


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug']
        read_only_fields = ['id']


class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        source='user', queryset=User.objects.all(), write_only=True
    )

    class Meta:
        model = Membership
        fields = ['id', 'user', 'user_id', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        # organization não é campo do serializer (vem de perform_create), então o
        # UniqueConstraint do model não consegue validar isso sozinho — sem isso, um
        # convite duplicado vira IntegrityError (500) em vez de 400.
        organization = self.context['view'].get_organization()
        user = attrs.get('user')
        existing = Membership.objects.filter(organization=organization, user=user)
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        if user and existing.exists():
            raise serializers.ValidationError({'user_id': 'Usuário já é membro desta organização.'})
        return attrs
