"""
User views for authentication and profile management
Location: backend/apps/users/views.py
"""

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from django.contrib.auth.decorators import permission_required
from .models import User, DriverProfile, PassengerProfile
from .serializers import (UserRegistrationSerializer, UserLoginSerializer, 
                         UserProfileSerializer, DriverProfileSerializer, 
                         PassengerProfileSerializer, UserListSerializer)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        refresh = RefreshToken.for_user(user)
        
        # Get profile based on user type
        profile_data = {}
        if user.user_type == 'driver':
            profile_data = DriverProfileSerializer(user.driver_profile).data
        elif user.user_type == 'passenger':
            profile_data = PassengerProfileSerializer(user.passenger_profile).data
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'profile': profile_data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def driver_profile(request):
    if request.user.user_type != 'driver':
        return Response({'error': 'User is not a driver'}, status=status.HTTP_403_FORBIDDEN)
    
    profile = DriverProfile.objects.get(user=request.user)
    serializer = DriverProfileSerializer(profile)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def passenger_profile(request):
    if request.user.user_type != 'passenger':
        return Response({'error': 'User is not a passenger'}, status=status.HTTP_403_FORBIDDEN)
    
    profile = PassengerProfile.objects.get(user=request.user)
    serializer = PassengerProfileSerializer(profile)
    return Response(serializer.data)

@api_view(['GET'])
@permission_required('users.view_user', raise_exception=True)
def user_list(request):
    users = User.objects.all()
    serializer = UserListSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_required('users.change_user', raise_exception=True)
def verify_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.is_verified = True
        user.save()
        return Response(UserProfileSerializer(user).data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@permission_required('users.change_user', raise_exception=True)
def approve_driver(request, driver_id):
    try:
        driver_profile = DriverProfile.objects.get(id=driver_id)
        driver_profile.is_approved = True
        driver_profile.save()
        return Response(DriverProfileSerializer(driver_profile).data)
    except DriverProfile.DoesNotExist:
        return Response({'error': 'Driver profile not found'}, status=status.HTTP_404_NOT_FOUND)