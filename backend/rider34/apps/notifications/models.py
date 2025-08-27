"""
Notification models for Rider34 app
Location: backend/apps/notifications/models.py
"""

from django.db import models
from apps.users.models import User

class Notification(models.Model):
    TYPE_CHOICES = (
        ('ride_request', 'Ride Request'),
        ('ride_accepted', 'Ride Accepted'),
        ('driver_arrived', 'Driver Arrived'),
        ('ride_completed', 'Ride Completed'),
        ('payment_received', 'Payment Received'),
        ('promotional', 'Promotional'),
        ('system', 'System'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=100)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_id = models.IntegerField(blank=True, null=True)  # ID of related object (ride, payment, etc.)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.notification_type} - {self.title}"