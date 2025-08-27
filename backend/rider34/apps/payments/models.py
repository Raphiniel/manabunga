"""
Payment models for Rider34 app
Location: backend/apps/payments/models.py
"""

from django.db import models
from apps.users.models import User
from apps.rides.models import Ride

class Payment(models.Model):
    METHOD_CHOICES = (
        ('cash', 'Cash'),
        ('paynow', 'PayNow'),
        ('ecocash', 'EcoCash'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    ride = models.OneToOneField(Ride, on_delete=models.CASCADE, related_name='payment')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=10, choices=METHOD_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    paynow_reference = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"Payment #{self.id} - {self.ride} - {self.amount} ZWL"