"""
Ride models for Rider34 app
Location: backend/apps/rides/models.py
"""

from django.db import models
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.geos import Point
from apps.users.models import User

class Ride(models.Model):
    STATUS_CHOICES = (
        ('requested', 'Requested'),
        ('accepted', 'Accepted'),
        ('driver_arrived', 'Driver Arrived'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    passenger = models.ForeignKey(User, on_delete=models.CASCADE, related_name='passenger_rides')
    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='driver_rides', null=True, blank=True)
    pickup_location = gis_models.PointField(geography=True)
    pickup_address = models.CharField(max_length=255)
    destination = gis_models.PointField(geography=True)
    destination_address = models.CharField(max_length=255)
    requested_fare = models.DecimalField(max_digits=10, decimal_places=2)
    agreed_fare = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    distance = models.FloatField(help_text="Distance in kilometers")
    estimated_duration = models.IntegerField(help_text="Estimated duration in minutes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Ride #{self.id} - {self.passenger.username} - {self.status}"

class RideOffer(models.Model):
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name='offers')
    driver = models.ForeignKey(User, on_delete=models.CASCADE)
    offered_fare = models.DecimalField(max_digits=10, decimal_places=2)
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('ride', 'driver')
    
    def __str__(self):
        return f"Offer from {self.driver.username} for Ride #{self.ride.id}"

class RideTracking(models.Model):
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name='tracking')
    location = gis_models.PointField(geography=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Tracking for Ride #{self.ride.id} at {self.timestamp}"

class Rating(models.Model):
    ride = models.OneToOneField(Ride, on_delete=models.CASCADE, related_name='rating')
    rated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_ratings')
    rated_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_ratings')
    score = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Rating {self.score} for {self.rated_user.username} by {self.rated_by.username}"