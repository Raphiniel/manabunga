"""
User serializers for API
Location: backend/apps/users/serializers.py
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, DriverProfile, PassengerProfile

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(choices=User.USER_TYPE_CHOICES)
    
    class Meta:
        model = User
        fields = ('username', 'phone_number', 'password', 'email', 'first_name', 'last_name', 'user_type')
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create profile based on user type
        if user.user_type == 'driver':
            DriverProfile.objects.create(user=user)
        elif user.user_type == 'passenger':
            PassengerProfile.objects.create(user=user)
            
        return user

class UserLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        phone_number = data.get('phone_number')
        password = data.get('password')
        
        if phone_number and password:
            user = authenticate(username=phone_number, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                    return data
                else:
                    raise serializers.ValidationError('User account is disabled.')
            else:
                raise serializers.ValidationError('Unable to login with provided credentials.')
        else:
            raise serializers.ValidationError('Must provide phone number and password.')

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'phone_number', 'email', 'first_name', 'last_name', 
                 'user_type', 'profile_picture', 'is_verified')

class DriverProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = DriverProfile
        fields = '__all__'

class PassengerProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = PassengerProfile
        fields = '__all__'

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'phone_number', 'email', 'first_name', 
                 'last_name', 'user_type', 'is_verified', 'date_joined')