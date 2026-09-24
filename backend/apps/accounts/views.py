from django.conf import settings
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .authentication import enforce_csrf
from .serializers import UserSerializer


class _EmptySerializer(serializers.Serializer):
    """Documenta um corpo de resposta vazio — o par de tokens vira Set-Cookie, não
    JSON; sem isso o schema herdado do simplejwt mentiria dizendo que access/refresh
    voltam no body."""


@extend_schema(responses={204: None})
@ensure_csrf_cookie
@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_csrf_cookie(request):
    # Nada no fluxo de login/refresh/logout força o Django a emitir o cookie
    # csrftoken — sem @ensure_csrf_cookie em algum endpoint, o frontend nunca teria
    # um valor pra ecoar no header X-CSRFToken. A SPA chama isso uma vez no boot.
    # authentication_classes=[]: um access cookie expirado não pode quebrar o
    # endpoint que existe justamente pra destravar o fluxo de re-autenticação.
    return Response(status=204)


def _set_auth_cookies(response, access, refresh):
    common = dict(
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        domain=settings.COOKIE_DOMAIN,
    )
    response.set_cookie(settings.AUTH_COOKIE_ACCESS, access, **common)
    response.set_cookie(
        settings.AUTH_COOKIE_REFRESH, refresh, path='/api/auth/token/refresh/', **common
    )


class CookieTokenObtainPairView(TokenObtainPairView):
    # Sem cookie ambiente ainda pra proteger (credenciais vêm no body, não de um
    # cookie que um site malicioso possa "andar de carona") — login fica de fora
    # da checagem de CSRF, e authentication_classes=[] evita que um access cookie
    # velho de uma sessão anterior derrube esta tentativa de login.
    authentication_classes = []

    @extend_schema(responses={200: _EmptySerializer})
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def finalize_response(self, request, response, *args, **kwargs):
        if response.status_code == 200:
            access, refresh = response.data.pop('access'), response.data.pop('refresh')
            _set_auth_cookies(response, access, refresh)
        return super().finalize_response(request, response, *args, **kwargs)


class CookieTokenRefreshView(TokenRefreshView):
    # authentication_classes=[]: o cookie de access pode estar expirado (é
    # geralmente por isso que o refresh está sendo chamado) — não pode quebrar o
    # fluxo que existe pra renová-lo. O refresh_token cookie é a credencial aqui,
    # então a checagem de CSRF é explícita, não delegada à classe de autenticação.
    authentication_classes = []

    @extend_schema(responses={200: _EmptySerializer})
    def post(self, request, *args, **kwargs):
        enforce_csrf(request)
        request.data['refresh'] = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
        return super().post(request, *args, **kwargs)

    def finalize_response(self, request, response, *args, **kwargs):
        if response.status_code == 200:
            access = response.data.pop('access')
            refresh = response.data.pop(
                'refresh', request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
            )
            _set_auth_cookies(response, access, refresh)
        return super().finalize_response(request, response, *args, **kwargs)


class LogoutView(APIView):
    @extend_schema(request=None, responses={204: None})
    def post(self, request):
        response = Response(status=204)
        response.delete_cookie(settings.AUTH_COOKIE_ACCESS, domain=settings.COOKIE_DOMAIN)
        response.delete_cookie(
            settings.AUTH_COOKIE_REFRESH,
            path='/api/auth/token/refresh/',
            domain=settings.COOKIE_DOMAIN,
        )
        return response


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: UserSerializer})
    def get(self, request):
        return Response(UserSerializer(request.user).data)
