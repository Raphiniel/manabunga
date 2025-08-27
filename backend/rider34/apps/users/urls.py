"""
URL routes for user management
Location: backend/apps/users/urls.py
"""

from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('profile/', views.user_profile, name='user_profile'),
    path('profile/driver/', views.driver_profile, name='driver_profile'),
    path('profile/passenger/', views.passenger_profile, name='passenger_profile'),
    path('users/', views.user_list, name='user_list'),
    path('users/<int:user_id>/verify/', views.verify_user, name='verify_user'),
    path('drivers/<int:driver_id>/approve/', views.approve_driver, name='approve_driver'),
]