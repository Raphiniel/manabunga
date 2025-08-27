"""
Payment serializers for API
Location: backend/apps/payments/serializers.py
"""

from rest_framework import serializers
from .models import Payment
from apps.users.serializers import UserProfileSerializer
from apps.rides.serializers import RideSerializer

class PaymentSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    ride = RideSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'completed_at')