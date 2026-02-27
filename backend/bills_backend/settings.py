"""
Django settings for household_bills_manager project.
All security hardening applied:
  - Short access token (15 min) + long refresh (30 days) via HttpOnly cookie
  - Rotating + blacklisted refresh tokens
  - CORS restricted by environment variable
  - HTTPS / cookie security flags
  - Rate limiting via django-ratelimit
  - No DEBUG in production
"""

import os
from pathlib import Path
from datetime import timedelta

# ─── Base ──────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'change-me-in-production')

# SECURITY WARNING: never run with DEBUG=True in production!
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = os.environ.get(
    'ALLOWED_HOSTS',
    'localhost,127.0.0.1,household-bills-manager-backend.vercel.app'
).split(',')


# ─── Applications ──────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt.token_blacklist',  # required for token blacklisting
    'corsheaders',

    # Local
    'bills_api',
]


# ─── Middleware ────────────────────────────────────────────────────────────────
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',          # must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'bills_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'bills_backend.wsgi.application'


# ─── Database ──────────────────────────────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# ─── Password validation ───────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
     'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ─── Internationalisation ──────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'UTC'
USE_I18N      = True
USE_TZ        = True


# ─── Static files ─────────────────────────────────────────────────────────────
STATIC_URL  = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ─── HTTPS / Security headers (active when DEBUG=False) ───────────────────────
if not DEBUG:
    SECURE_SSL_REDIRECT              = True
    SECURE_HSTS_SECONDS              = 31536000   # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS   = True
    SECURE_HSTS_PRELOAD              = True
    SECURE_BROWSER_XSS_FILTER        = True
    SECURE_CONTENT_TYPE_NOSNIFF      = True
    SESSION_COOKIE_SECURE            = True
    CSRF_COOKIE_SECURE               = True
    X_FRAME_OPTIONS                  = 'DENY'


# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOW_CREDENTIALS = True

# In development you can set CORS_ALLOW_ALL_ORIGINS=true in your .env.
# In production, set CORS_ALLOWED_ORIGINS to your exact frontend URL(s).
if os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'False').lower() == 'true':
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOWED_ORIGINS   = []
else:
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_ORIGINS   = os.environ.get(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:3000,https://household-bills-manager.vercel.app',
    ).split(',')

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]


# ─── Django REST Framework ─────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    # Throttling — server-side rate limiting (backup to django-ratelimit)
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/minute',   # unauthenticated requests
        'user': '300/minute',  # authenticated requests
    },
}


# ─── Simple JWT ────────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    # Short-lived access token — limits damage if stolen
    'ACCESS_TOKEN_LIFETIME':  timedelta(minutes=15),

    # Long-lived refresh token — stored only in HttpOnly cookie
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),

    # Rotate refresh tokens on every use + blacklist old ones
    'ROTATE_REFRESH_TOKENS':   True,
    'BLACKLIST_AFTER_ROTATION': True,

    'AUTH_HEADER_TYPES': ('Bearer',),
}


# ─── Rate limiting (django-ratelimit) ─────────────────────────────────────────
# Install with: pip install django-ratelimit
# These are used as decorators in auth_views.py.
# RATELIMIT_USE_CACHE = 'default'  # use Django cache backend for counters


# ─── Cache (used by rate limiter) ─────────────────────────────────────────────
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}
# For production with multiple workers, switch to Redis:
# CACHES = {
#     'default': {
#         'BACKEND': 'django_redis.cache.RedisCache',
#         'LOCATION': os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379/1'),
#     }
# }


# ─── Logging ───────────────────────────────────────────────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class':     'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level':    'WARNING',
    },
    'loggers': {
        'django': {
            'handlers':  ['console'],
            'level':     os.environ.get('DJANGO_LOG_LEVEL', 'WARNING'),
            'propagate': False,
        },
        'django.security': {
            'handlers':  ['console'],
            'level':     'WARNING',
            'propagate': False,
        },
    },
}