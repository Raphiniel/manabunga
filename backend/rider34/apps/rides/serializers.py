"""
Ride serializers for API
Location: backend/apps/rides/serializers.py
"""

from rest_framework import serializers
from .models import Ride, RideOffer, Rating
from apps.users.serializers import UserProfileSerializer

class RideSerializer(serializers.ModelSerializer):
    passenger = UserProfileSerializer(read_only=True)
    driver = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Ride
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'started_at', 'completed_at')

class RideOfferSerializer(serializers.ModelSerializer):
    driver = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = RideOffer
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'is_accepted')

class RatingSerializer(serializers.ModelSerializer):
    rated_by = UserProfileSerializer(read_only=True)
    rated_user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Rating
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'rated_by', 'rated_user', 'ride')