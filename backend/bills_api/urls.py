from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillViewSet, RegisterView, CustomAuthToken

router = DefaultRouter()
router.register(r'bills', BillViewSet, basename='bill')  # Add basename here
router.register(r'register', RegisterView, basename='register')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', CustomAuthToken.as_view(), name='login'),
]