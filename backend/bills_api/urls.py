from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillViewSet
from . import auth_views

router = DefaultRouter()
router.register(r'bills', BillViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', auth_views.register, name='register'),
    path('auth/login/', auth_views.user_login, name='login'),
    path('auth/logout/', auth_views.user_logout, name='logout'),
    path('auth/me/', auth_views.get_current_user, name='current_user'),
]