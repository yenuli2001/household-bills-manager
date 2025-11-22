from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillViewSet, register_user, login_user, user_profile

router = DefaultRouter()
router.register(r'bills', BillViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('profile/', user_profile, name='profile'),
]