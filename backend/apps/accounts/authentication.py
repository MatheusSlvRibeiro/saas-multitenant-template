from django.conf import settings
from django.middleware.csrf import CsrfViewMiddleware
from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication


class _CsrfCheck(CsrfViewMiddleware):
    def _get_response(self, request):
        return None


def enforce_csrf(request):
    """Réplica de SessionAuthentication.enforce_csrf do DRF. APIView aplica
    @csrf_exempt em todo view por padrão (é o que permite auth via header Bearer
    sem dor de CSRF); isso religa a checagem pra quem autentica via cookie."""
    check = _CsrfCheck(lambda r: None)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise exceptions.PermissionDenied(f'CSRF Failed: {reason}')


class CookieJWTAuthentication(JWTAuthentication):
    """Lê o access token do cookie httpOnly; cai pro header Bearer se o cookie não
    existir (clientes non-browser: mobile, integração server-to-server).

    Só usada em views que exigem uma sessão já estabelecida (ex.: MeView) — login,
    refresh e o endpoint de csrf ficam fora daqui (authentication_classes = []),
    senão um access cookie expirado quebraria o próprio fluxo que deveria renová-lo."""

    def authenticate(self, request):
        raw_token = request.COOKIES.get(settings.AUTH_COOKIE_ACCESS)
        if raw_token is None:
            return super().authenticate(request)

        validated_token = self.get_validated_token(raw_token)
        enforce_csrf(request)
        return self.get_user(validated_token), validated_token
