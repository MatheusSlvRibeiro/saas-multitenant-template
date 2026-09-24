from drf_spectacular.extensions import OpenApiAuthenticationExtension


class CookieJWTScheme(OpenApiAuthenticationExtension):
    """Descreve CookieJWTAuthentication pro drf-spectacular — sem isso ele avisa em
    toda view protegida que não sabe resolver o autenticador."""

    target_class = 'apps.accounts.authentication.CookieJWTAuthentication'
    name = 'cookieAuth'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'apiKey',
            'in': 'cookie',
            'name': 'access_token',
            'description': 'JWT em cookie httpOnly. Requests não-GET exigem o header X-CSRFToken.',
        }
