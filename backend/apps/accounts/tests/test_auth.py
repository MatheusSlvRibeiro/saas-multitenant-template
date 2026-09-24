import pytest
from django.conf import settings
from rest_framework.test import APIClient

from .factories import UserFactory


@pytest.fixture
def client_with_csrf():
    """APIClient com enforce_csrf_checks ligado — é o único jeito de um teste
    pegar um X-CSRFToken faltando/errado, já que o client padrão do DRF ignora CSRF."""
    return APIClient(enforce_csrf_checks=True)


@pytest.fixture
def csrf_token(client_with_csrf):
    client_with_csrf.get('/api/auth/csrf/')
    return client_with_csrf.cookies['csrftoken'].value


@pytest.mark.django_db
def test_login_sets_httponly_cookies_and_omits_tokens_from_body(client_with_csrf, csrf_token):
    UserFactory(username='alice', password='strong-pass-123')

    response = client_with_csrf.post(
        '/api/auth/token/',
        {'username': 'alice', 'password': 'strong-pass-123'},
        HTTP_X_CSRFTOKEN=csrf_token,
    )

    assert response.status_code == 200
    assert 'access' not in response.data
    assert 'refresh' not in response.data
    assert response.cookies[settings.AUTH_COOKIE_ACCESS]['httponly']
    assert response.cookies[settings.AUTH_COOKIE_REFRESH]['httponly']


@pytest.mark.django_db
def test_login_invalid_credentials_returns_401(client_with_csrf, csrf_token):
    UserFactory(username='alice', password='strong-pass-123')

    response = client_with_csrf.post(
        '/api/auth/token/',
        {'username': 'alice', 'password': 'wrong-password'},
        HTTP_X_CSRFTOKEN=csrf_token,
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_refresh_rotates_cookies_and_blacklists_old_refresh(client_with_csrf, csrf_token):
    UserFactory(username='alice', password='strong-pass-123')
    client_with_csrf.post(
        '/api/auth/token/',
        {'username': 'alice', 'password': 'strong-pass-123'},
        HTTP_X_CSRFTOKEN=csrf_token,
    )
    old_refresh = client_with_csrf.cookies[settings.AUTH_COOKIE_REFRESH].value

    response = client_with_csrf.post('/api/auth/token/refresh/', HTTP_X_CSRFTOKEN=csrf_token)

    assert response.status_code == 200
    new_refresh = response.cookies[settings.AUTH_COOKIE_REFRESH].value
    assert new_refresh != old_refresh

    # o refresh antigo foi rotacionado (blacklist) — reusar deve falhar
    client_with_csrf.cookies[settings.AUTH_COOKIE_REFRESH] = old_refresh
    reuse_response = client_with_csrf.post('/api/auth/token/refresh/', HTTP_X_CSRFTOKEN=csrf_token)
    assert reuse_response.status_code == 401


@pytest.mark.django_db
def test_logout_clears_cookies(client_with_csrf, csrf_token):
    UserFactory(username='alice', password='strong-pass-123')
    client_with_csrf.post(
        '/api/auth/token/',
        {'username': 'alice', 'password': 'strong-pass-123'},
        HTTP_X_CSRFTOKEN=csrf_token,
    )

    response = client_with_csrf.post('/api/auth/logout/', HTTP_X_CSRFTOKEN=csrf_token)

    assert response.status_code == 204
    assert response.cookies[settings.AUTH_COOKIE_ACCESS].value == ''
    assert response.cookies[settings.AUTH_COOKIE_REFRESH].value == ''


@pytest.mark.django_db
def test_csrf_blocks_refresh_without_header(client_with_csrf, csrf_token):
    UserFactory(username='alice', password='strong-pass-123')
    client_with_csrf.post(
        '/api/auth/token/',
        {'username': 'alice', 'password': 'strong-pass-123'},
        HTTP_X_CSRFTOKEN=csrf_token,
    )

    # /token/refresh/ anda de carona no refresh_token cookie ambiente — é exatamente
    # o tipo de request que um site malicioso poderia forjar sem o header CSRF.
    response = client_with_csrf.post('/api/auth/token/refresh/')

    assert response.status_code == 403


@pytest.mark.django_db
def test_csrf_blocks_logout_without_header(client_with_csrf, csrf_token):
    UserFactory(username='alice', password='strong-pass-123')
    client_with_csrf.post(
        '/api/auth/token/',
        {'username': 'alice', 'password': 'strong-pass-123'},
        HTTP_X_CSRFTOKEN=csrf_token,
    )

    response = client_with_csrf.post('/api/auth/logout/')

    assert response.status_code == 403


@pytest.mark.django_db
def test_me_returns_authenticated_user(client_with_csrf, csrf_token):
    UserFactory(username='alice', password='strong-pass-123')
    client_with_csrf.post(
        '/api/auth/token/',
        {'username': 'alice', 'password': 'strong-pass-123'},
        HTTP_X_CSRFTOKEN=csrf_token,
    )

    response = client_with_csrf.get('/api/auth/me/')

    assert response.status_code == 200
    assert response.data['username'] == 'alice'


@pytest.mark.django_db
def test_me_requires_authentication():
    client = APIClient()

    response = client.get('/api/auth/me/')

    assert response.status_code == 401
