import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """AUTH_USER_MODEL. Só existe pra trocar o pk pra UUID — o resto do template
    segue o padrão do harness (backend/django-drf → models.md: "PK: UUID por
    padrão"). Sem isso, o Django User embutido usa um BigAutoField sequencial."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
