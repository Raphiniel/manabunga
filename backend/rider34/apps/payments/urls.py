"""
URL routes for payment management
Location: backend/apps/payments/urls.py
"""

from django.urls import path
from . import views

urlpatterns = [
    path('create/<int:ride_id>/', views.create_payment, name='create_payment'),
    path('user-payments/', views.user_payments, name='user_payments'),
    path('<int:payment_id>/', views.payment_detail, name='payment_detail'),
    path('<int:payment_id>/status/', views.update_payment_status, name='update_payment_status'),
    path('all/', views.all_payments, name='all_payments'),
]