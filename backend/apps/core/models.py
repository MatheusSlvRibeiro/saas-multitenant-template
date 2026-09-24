import uuid

from django.db import models


class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']


class TenantScopedModel(BaseModel):
    """Base pra todo model que pertence a uma Organization. `TenantScopedViewSetMixin`
    depende do campo se chamar exatamente `organization` — não renomeie."""

    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='%(class)s_set',
    )

    class Meta(BaseModel.Meta):
        abstract = True
