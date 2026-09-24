import factory
from django.contrib.auth import get_user_model

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        skip_postgeneration_save = True

    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')

    @factory.post_generation
    def password(obj, create, extracted, **kwargs):
        obj.set_password(extracted or 'strong-pass-123')
        if create:
            obj.save()
