from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillViewSet, register, login

router = DefaultRouter()
router.register(r'bills', BillViewSet, basename='bill')  # ADD basename here

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register, name='register'),
    path('login/', login, name='login'),
]