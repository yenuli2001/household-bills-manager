from django.contrib.auth.models import User
from django.conf import settings
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

try:
    from django_ratelimit.decorators import ratelimit
    RATELIMIT_AVAILABLE = True
except ImportError:
    RATELIMIT_AVAILABLE = False
    # If django-ratelimit is not installed, define a no-op decorator
    def ratelimit(**kwargs):
        def decorator(func):
            return func
        return decorator


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _set_refresh_cookie(response, refresh_token):
    """Store refresh token in a secure HttpOnly cookie."""
    secure = not settings.DEBUG
    max_age = int(settings.SIMPLE_JWT.get('REFRESH_TOKEN_LIFETIME').total_seconds())
    response.set_cookie(
        'refresh_token',
        refresh_token,
        httponly=True,
        secure=secure,
        samesite='None',
        max_age=max_age,
    )


def _validate_registration_input(username, password, email=None):
    """
    Validate registration inputs.
    Returns (error_message, None) on failure or (None, cleaned_data) on success.
    """
    if not username or not isinstance(username, str):
        return 'Username is required.', None
    username = username.strip()
    if len(username) < 3 or len(username) > 50:
        return 'Username must be between 3 and 50 characters.', None
    if not username.replace('_', '').isalnum():
        return 'Username can only contain letters, numbers, and underscores.', None

    if not password or not isinstance(password, str):
        return 'Password is required.', None
    if len(password) < 8:
        return 'Password must be at least 8 characters.', None
    if len(password) > 128:
        return 'Password is too long.', None

    cleaned_email = None
    if email:
        email = email.strip()
        if len(email) > 254:
            return 'Email address is too long.', None
        try:
            validate_email(email)
            cleaned_email = email
        except ValidationError:
            return 'Please enter a valid email address.', None

    return None, {'username': username, 'password': password, 'email': cleaned_email}


# ─── Register ─────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='10/m', method='POST', block=True)
def register(request):
    username = request.data.get('username')
    email    = request.data.get('email')
    password = request.data.get('password')

    error, cleaned = _validate_registration_input(username, password, email)
    if error:
        return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

    # Generic "already exists" so attackers can't enumerate usernames easily
    if User.objects.filter(username__iexact=cleaned['username']).exists():
        return Response(
            {'error': 'An account with that username already exists.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if cleaned['email'] and User.objects.filter(email__iexact=cleaned['email']).exists():
        # Don't reveal whether email is registered — return success-like response
        return Response(
            {'error': 'An account with that email already exists.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(
        username=cleaned['username'],
        email=cleaned['email'] or '',
        password=cleaned['password'],
    )

    refresh = RefreshToken.for_user(user)
    access  = str(refresh.access_token)

    resp = Response({
        'message': 'Account created successfully.',
        'user': {
            'id':       user.id,
            'username': user.username,
            'email':    user.email,
        },
        'access': access,
    }, status=status.HTTP_201_CREATED)

    _set_refresh_cookie(resp, str(refresh))
    return resp


# ─── Login (Cookie-based) ─────────────────────────────────────────────────────

class CookieTokenObtainPairView(TokenObtainPairView):
    permission_classes = (AllowAny,)

    @ratelimit(key='ip', rate='10/m', method='POST', block=True)
    def post(self, request, *args, **kwargs):
        # Input length guards before hitting the DB
        username = request.data.get('username', '')
        password = request.data.get('password', '')

        if not username or len(username) > 50:
            return Response(
                {'detail': 'Invalid credentials.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not password or len(password) > 128:
            return Response(
                {'detail': 'Invalid credentials.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        original_response = super().post(request, *args, **kwargs)

        if original_response.status_code == 200:
            refresh = original_response.data.get('refresh')
            access  = original_response.data.get('access')
            resp = Response({'access': access}, status=200)
            _set_refresh_cookie(resp, refresh)
            return resp

        # Return a generic message regardless of why login failed
        return Response(
            {'detail': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )


# ─── Token Refresh ────────────────────────────────────────────────────────────

class CookieTokenRefreshView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get('refresh_token')

        if not refresh:
            return Response(
                {'detail': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = TokenRefreshSerializer(data={'refresh': refresh})
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            resp = Response(
                {'detail': 'Session expired. Please log in again.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            resp.delete_cookie('refresh_token')
            return resp

        data        = serializer.validated_data
        access      = data.get('access')
        new_refresh = data.get('refresh')

        resp = Response({'access': access})
        if new_refresh:
            _set_refresh_cookie(resp, new_refresh)
        return resp


# ─── Logout ───────────────────────────────────────────────────────────────────

@api_view(['POST'])
def logout(request):
    refresh = request.COOKIES.get('refresh_token')

    if refresh:
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except Exception:
            pass  # Already blacklisted or invalid — still clear the cookie

    resp = Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
    resp.delete_cookie('refresh_token')
    return resp


# ─── Current user ─────────────────────────────────────────────────────────────

@api_view(['GET'])
def get_current_user(request):
    user = request.user
    return Response({
        'id':       user.id,
        'username': user.username,
        'email':    user.email,
    })