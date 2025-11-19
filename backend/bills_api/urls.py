from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillViewSet, simple_login

router = DefaultRouter()
router.register(r'bills', BillViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/simple-login/', simple_login, name='simple_login'),
]