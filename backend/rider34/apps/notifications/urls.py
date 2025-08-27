"""
URL routes for notification management
Location: backend/apps/notifications/urls.py
"""

from django.urls import path
from . import views

urlpatterns = [
    path('user-notifications/', views.user_notifications, name='user_notifications'),
    path('<int:notification_id>/read/', views.mark_as_read, name='mark_as_read'),
    path('read-all/', views.mark_all_as_read, name='mark_all_as_read'),
    path('<int:notification_id>/delete/', views.delete_notification, name='delete_notification'),
    path('send/', views.send_notification, name='send_notification'),
]