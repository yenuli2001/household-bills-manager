from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def root_view(request):
    return JsonResponse({
        'message': 'Backend is running!',
        'api': '/api/',
        'admin': '/admin/',
    })

urlpatterns = [
    path('', root_view),  # Add this for root URL
    path('admin/', admin.site.urls),
    path('api/', include('bills_api.urls')),
]