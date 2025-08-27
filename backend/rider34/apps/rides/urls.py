"""
URL routes for ride management
Location: backend/apps/rides/urls.py
"""

from django.urls import path
from . import views

urlpatterns = [
    path('request/', views.request_ride, name='request_ride'),
    path('available/', views.available_rides, name='available_rides'),
    path('offers/<int:ride_id>/', views.make_offer, name='make_offer'),
    path('offers/accept/<int:offer_id>/', views.accept_offer, name='accept_offer'),
    path('user-rides/', views.user_rides, name='user_rides'),
    path('update-status/<int:ride_id>/', views.update_ride_status, name='update_ride_status'),
    path('rate/<int:ride_id>/', views.rate_ride, name='rate_ride'),
    path('<int:ride_id>/', views.ride_detail, name='ride_detail'),
    path('all/', views.all_rides, name='all_rides'),
]