"""
Ride views for API
Location: backend/apps/rides/views.py
"""

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.db.models import Q
from .models import Ride, RideOffer, Rating
from .serializers import RideSerializer, RideOfferSerializer, RatingSerializer
from apps.users.models import User

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def request_ride(request):
    if request.user.user_type != 'passenger':
        return Response({'error': 'Only passengers can request rides'}, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data.copy()
    
    # Convert coordinates to Point objects
    pickup_lat = float(data.get('pickup_lat'))
    pickup_lng = float(data.get('pickup_lng'))
    dest_lat = float(data.get('dest_lat'))
    dest_lng = float(data.get('dest_lng'))
    
    data['pickup_location'] = Point(pickup_lng, pickup_lat)
    data['destination'] = Point(dest_lng, dest_lat)
    
    serializer = RideSerializer(data=data)
    if serializer.is_valid():
        ride = serializer.save(passenger=request.user)
        return Response(RideSerializer(ride).data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def available_rides(request):
    if request.user.user_type != 'driver':
        return Response({'error': 'Only drivers can view available rides'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get driver's current location from query params
    lat = float(request.GET.get('lat', 0))
    lng = float(request.GET.get('lng', 0))
    driver_location = Point(lng, lat)
    
    # Find rides within 10km radius that are requested
    rides = Ride.objects.filter(
        status='requested'
    ).annotate(
        distance=Distance('pickup_location', driver_location)
    ).filter(
        distance__lte=10000  # 10km in meters
    ).order_by('distance')
    
    serializer = RideSerializer(rides, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def make_offer(request, ride_id):
    if request.user.user_type != 'driver':
        return Response({'error': 'Only drivers can make offers'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        ride = Ride.objects.get(id=ride_id, status='requested')
    except Ride.DoesNotExist:
        return Response({'error': 'Ride not found or not available'}, status=status.HTTP_404_NOT_FOUND)
    
    offered_fare = request.data.get('offered_fare')
    
    # Check if driver already made an offer for this ride
    existing_offer = RideOffer.objects.filter(ride=ride, driver=request.user).first()
    if existing_offer:
        return Response({'error': 'You have already made an offer for this ride'}, status=status.HTTP_400_BAD_REQUEST)
    
    offer = RideOffer.objects.create(
        ride=ride,
        driver=request.user,
        offered_fare=offered_fare
    )
    
    serializer = RideOfferSerializer(offer)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def accept_offer(request, offer_id):
    try:
        offer = RideOffer.objects.get(id=offer_id)
    except RideOffer.DoesNotExist:
        return Response({'error': 'Offer not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if offer.ride.passenger != request.user:
        return Response({'error': 'Only the passenger can accept an offer'}, status=status.HTTP_403_FORBIDDEN)
    
    if offer.ride.status != 'requested':
        return Response({'error': 'Ride is no longer available'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Update ride with accepted offer
    offer.ride.driver = offer.driver
    offer.ride.agreed_fare = offer.offered_fare
    offer.ride.status = 'accepted'
    offer.ride.save()
    
    # Mark offer as accepted
    offer.is_accepted = True
    offer.save()
    
    # Reject all other offers for this ride
    RideOffer.objects.filter(ride=offer.ride).exclude(id=offer.id).update(is_accepted=False)
    
    serializer = RideSerializer(offer.ride)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_rides(request):
    if request.user.user_type == 'passenger':
        rides = Ride.objects.filter(passenger=request.user).order_by('-created_at')
    elif request.user.user_type == 'driver':
        rides = Ride.objects.filter(driver=request.user).order_by('-created_at')
    else:
        rides = Ride.objects.none()
    
    serializer = RideSerializer(rides, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_ride_status(request, ride_id):
    try:
        ride = Ride.objects.get(id=ride_id)
    except Ride.DoesNotExist:
        return Response({'error': 'Ride not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if ride.driver != request.user and ride.passenger != request.user:
        return Response({'error': 'Not authorized to update this ride'}, status=status.HTTP_403_FORBIDDEN)
    
    new_status = request.data.get('status')
    if new_status not in dict(Ride.STATUS_CHOICES):
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    
    ride.status = new_status
    ride.save()
    
    serializer = RideSerializer(ride)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def rate_ride(request, ride_id):
    try:
        ride = Ride.objects.get(id=ride_id)
    except Ride.DoesNotExist:
        return Response({'error': 'Ride not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if ride.status != 'completed':
        return Response({'error': 'Can only rate completed rides'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Determine who is being rated
    if request.user == ride.passenger:
        rated_user = ride.driver
    elif request.user == ride.driver:
        rated_user = ride.passenger
    else:
        return Response({'error': 'Not authorized to rate this ride'}, status=status.HTTP_403_FORBIDDEN)
    
    # Check if already rated
    existing_rating = Rating.objects.filter(ride=ride, rated_by=request.user).first()
    if existing_rating:
        return Response({'error': 'You have already rated this ride'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = RatingSerializer(data=request.data)
    if serializer.is_valid():
        rating = serializer.save(
            ride=ride,
            rated_by=request.user,
            rated_user=rated_user
        )
        
        # Update user's average rating
        if rated_user.user_type == 'driver':
            profile = rated_user.driver_profile
        else:
            profile = rated_user.passenger_profile
        
        # Calculate new average rating
        all_ratings = Rating.objects.filter(rated_user=rated_user)
        total_ratings = all_ratings.count()
        total_score = sum(r.score for r in all_ratings)
        profile.rating = total_score / total_ratings
        profile.save()
        
        return Response(RatingSerializer(rating).data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ride_detail(request, ride_id):
    try:
        ride = Ride.objects.get(id=ride_id)
    except Ride.DoesNotExist:
        return Response({'error': 'Ride not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if ride.driver != request.user and ride.passenger != request.user and not request.user.is_staff:
        return Response({'error': 'Not authorized to view this ride'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = RideSerializer(ride)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def all_rides(request):
    rides = Ride.objects.all().order_by('-created_at')
    serializer = RideSerializer(rides, many=True)
    return Response(serializer.data)