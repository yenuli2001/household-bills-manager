from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .views import BillViewSet

@api_view(['GET'])
def api_root(request):
    return Response({
        'message': 'Bills API is running!',
        'endpoints': {
            'bills': '/api/bills/',
        }
    })

router = DefaultRouter()
router.register(r'bills', BillViewSet)

urlpatterns = [
    path('', api_root),  # Test endpoint
    path('', include(router.urls)),
]
