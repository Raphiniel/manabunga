"""
WebSocket consumers for real-time ride updates
Location: backend/apps/rides/consumers.py
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from .models import Ride

User = get_user_model()

class RideConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        
        if self.user.is_anonymous:
            await self.close()
        else:
            # Join user-specific room
            self.room_name = f"user_{self.user.id}"
            self.room_group_name = f"rides_{self.room_name}"
            
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            await self.accept()
    
    async def disconnect(self, close_code):
        if not self.user.is_anonymous:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'ride.update':
            await self.handle_ride_update(data)
        elif message_type == 'location.update':
            await self.handle_location_update(data)
    
    async def handle_ride_update(self, data):
        ride_id = data.get('ride_id')
        status = data.get('status')
        
        # Update ride status in database
        ride = await self.get_ride(ride_id)
        if ride and (ride.driver == self.user or ride.passenger == self.user):
            ride.status = status
            await database_sync_to_async(ride.save)()
            
            # Notify all parties involved
            await self.channel_layer.group_send(
                f"rides_user_{ride.passenger.id}",
                {
                    'type': 'ride_status_update',
                    'ride_id': ride_id,
                    'status': status
                }
            )
            
            if ride.driver:
                await self.channel_layer.group_send(
                    f"rides_user_{ride.driver.id}",
                    {
                        'type': 'ride_status_update',
                        'ride_id': ride_id,
                        'status': status
                    }
                )
    
    async def handle_location_update(self, data):
        ride_id = data.get('ride_id')
        lat = data.get('lat')
        lng = data.get('lng')
        
        # Update ride location in database
        ride = await self.get_ride(ride_id)
        if ride and ride.driver == self.user:
            # Create tracking record
            from django.contrib.gis.geos import Point
            from .models import RideTracking
            
            point = Point(lng, lat)
            await database_sync_to_async(RideTracking.objects.create)(
                ride=ride,
                location=point
            )
            
            # Notify passenger
            await self.channel_layer.group_send(
                f"rides_user_{ride.passenger.id}",
                {
                    'type': 'driver_location_update',
                    'ride_id': ride_id,
                    'lat': lat,
                    'lng': lng
                }
            )
    
    async def ride_status_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'ride_status_update',
            'ride_id': event['ride_id'],
            'status': event['status']
        }))
    
    async def driver_location_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'driver_location_update',
            'ride_id': event['ride_id'],
            'lat': event['lat'],
            'lng': event['lng']
        }))
    
    @database_sync_to_async
    def get_ride(self, ride_id):
        try:
            return Ride.objects.get(id=ride_id)
        except Ride.DoesNotExist:
            return None