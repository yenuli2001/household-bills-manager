from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillViewSet
from .auth_views import (
    register,
    get_current_user,
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    logout,
)

router = DefaultRouter()
router.register(r'bills', BillViewSet, basename='bill')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register,                        name='register'),
    path('auth/login/',    CookieTokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/',  CookieTokenRefreshView.as_view(),    name='token_refresh'),
    path('auth/logout/',   logout,                          name='logout'),
    path('auth/user/',     get_current_user,                name='current_user'),
]