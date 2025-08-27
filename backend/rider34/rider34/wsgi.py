"""
WSGI config for rider34 project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rider34.settings')

application = get_wsgi_application()