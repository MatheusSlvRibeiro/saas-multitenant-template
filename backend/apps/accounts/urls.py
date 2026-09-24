from django.urls import path

from .views import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView,
    MeView,
    get_csrf_cookie,
)

urlpatterns = [
    path('csrf/', get_csrf_cookie),
    path('token/', CookieTokenObtainPairView.as_view()),
    path('token/refresh/', CookieTokenRefreshView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('me/', MeView.as_view()),
]
