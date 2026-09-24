from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView

from .health import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/auth/', include('apps.accounts.urls')),
]
