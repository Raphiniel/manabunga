from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, DriverProfile, PassengerProfile

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'phone_number', 'email', 'user_type', 'is_verified', 'is_staff')
    list_filter = ('user_type', 'is_verified', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        ('Rider34 Info', {'fields': ('phone_number', 'user_type', 'profile_picture', 'is_verified')}),
    )

@admin.register(DriverProfile)
class DriverProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'vehicle_make', 'vehicle_model', 'vehicle_plate', 'is_approved', 'rating')
    list_filter = ('is_approved', 'vehicle_make')
    search_fields = ('user__username', 'user__phone_number', 'vehicle_plate')

@admin.register(PassengerProfile)
class PassengerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'rating', 'total_rides')
    search_fields = ('user__username', 'user__phone_number')