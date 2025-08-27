"""
User models for Rider34 app
Location: backend/apps/users/models.py
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('passenger', 'Passenger'),
        ('driver', 'Driver'),
        ('admin', 'Administrator'),
    )
    
    # Changed: Made phone_number optional with null=True and blank=True
    phone_number = PhoneNumberField(unique=True, region='ZW', null=True, blank=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='passenger')
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.username} ({self.phone_number})"

class DriverProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile')
    license_number = models.CharField(max_length=50)
    license_picture = models.ImageField(upload_to='driver_licenses/')
    vehicle_make = models.CharField(max_length=50)
    vehicle_model = models.CharField(max_length=50)
    vehicle_year = models.IntegerField()
    vehicle_color = models.CharField(max_length=30)
    vehicle_plate = models.CharField(max_length=20)
    vehicle_picture = models.ImageField(upload_to='vehicle_pictures/')
    is_approved = models.BooleanField(default=False)
    rating = models.FloatField(default=5.0)
    total_rides = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.username} - {self.vehicle_make} {self.vehicle_model}"

class PassengerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='passenger_profile')
    favorite_locations = models.JSONField(default=list)
    rating = models.FloatField(default=5.0)
    total_rides = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.username} - Passenger"