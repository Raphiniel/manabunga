from django.contrib import admin
from .models import Ride, RideOffer, RideTracking, Rating

@admin.register(Ride)
class RideAdmin(admin.ModelAdmin):
    list_display = ('id', 'passenger', 'driver', 'status', 'requested_fare', 'agreed_fare', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('passenger__username', 'driver__username', 'pickup_address', 'destination_address')

@admin.register(RideOffer)
class RideOfferAdmin(admin.ModelAdmin):
    list_display = ('ride', 'driver', 'offered_fare', 'is_accepted', 'created_at')
    list_filter = ('is_accepted', 'created_at')
    search_fields = ('ride__id', 'driver__username')

@admin.register(RideTracking)
class RideTrackingAdmin(admin.ModelAdmin):
    list_display = ('ride', 'timestamp')
    list_filter = ('timestamp',)

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('ride', 'rated_by', 'rated_user', 'score', 'created_at')
    list_filter = ('score', 'created_at')
    search_fields = ('ride__id', 'rated_by__username', 'rated_user__username')