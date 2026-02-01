import sys
import os

# Add the parent directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import Django application
from bills_backend.wsgi import application

# Vercel entry point
app = application