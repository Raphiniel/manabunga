"""
WebSocket routing for rides
Location: backend/apps/rides/routing.py
"""

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/rides/$', consumers.RideConsumer.as_asgi()),
]