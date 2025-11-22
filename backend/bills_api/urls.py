from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillViewSet, LoginView, RegisterView, LogoutView, CheckAuthView

router = DefaultRouter()
router.register(r'bills', BillViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('check-auth/', CheckAuthView.as_view(), name='check_auth'),
]