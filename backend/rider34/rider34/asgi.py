"""
ASGI config for rider34 project.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import apps.rides.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rider34.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            apps.rides.routing.websocket_urlpatterns
        )
    ),
})