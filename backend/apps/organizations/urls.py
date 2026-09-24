from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import MembershipViewSet, MyOrganizationsView

# SimpleRouter, não DefaultRouter: o root view que o DefaultRouter gera automaticamente
# não é tenant-scoped (é só um índice), o que quebraria o teste de enforcement abaixo.
router = SimpleRouter()
router.register('members', MembershipViewSet, basename='membership')

urlpatterns = [
    path('organizations/', MyOrganizationsView.as_view()),
    path('orgs/<slug:org_slug>/', include(router.urls)),
]
