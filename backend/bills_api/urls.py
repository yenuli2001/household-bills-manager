from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillViewSet
from .auth_views import register, user_login, user_logout, get_current_user

router = DefaultRouter()
router.register(r'bills', BillViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register, name='register'),
    path('auth/login/', user_login, name='login'),
    path('auth/logout/', user_logout, name='logout'),
    path('auth/user/', get_current_user, name='get_current_user'),
]