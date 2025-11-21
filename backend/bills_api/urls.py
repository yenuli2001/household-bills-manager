from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillViewSet, RegisterView, CustomAuthToken

router = DefaultRouter()
router.register(r'bills', BillViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomAuthToken.as_view(), name='login'),
]