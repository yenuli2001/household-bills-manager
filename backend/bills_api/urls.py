from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillViewSet, google_oauth_callback

router = DefaultRouter()
router.register(r'bills', BillViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/google/', google_oauth_callback, name='google_oauth'),
]