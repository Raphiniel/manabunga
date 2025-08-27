"""
Payment views for API
Location: backend/apps/payments/views.py
"""

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer
from apps.rides.models import Ride

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_payment(request, ride_id):
    try:
        ride = Ride.objects.get(id=ride_id)
    except Ride.DoesNotExist:
        return Response({'error': 'Ride not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if ride.passenger != request.user:
        return Response({'error': 'Not authorized to create payment for this ride'}, status=status.HTTP_403_FORBIDDEN)
    
    if ride.status != 'completed':
        return Response({'error': 'Payment can only be created for completed rides'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if payment already exists
    if hasattr(ride, 'payment'):
        return Response({'error': 'Payment already exists for this ride'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = PaymentSerializer(data=request.data)
    if serializer.is_valid():
        payment = serializer.save(
            ride=ride,
            user=request.user,
            amount=ride.agreed_fare or ride.requested_fare
        )
        
        # Process payment based on method
        if payment.method == 'paynow':
            # Initiate PayNow payment
            result = initiate_paynow_payment(payment)
            if result['success']:
                payment.paynow_reference = result['reference']
                payment.save()
                return Response({
                    'payment': PaymentSerializer(payment).data,
                    'redirect_url': result['redirect_url']
                }, status=status.HTTP_201_CREATED)
            else:
                payment.delete()
                return Response({'error': result['message']}, status=status.HTTP_400_BAD_REQUEST)
        
        elif payment.method == 'cash':
            # For cash payments, mark as completed immediately
            payment.status = 'completed'
            payment.save()
            return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)
        
        else:
            return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_payments(request):
    payments = Payment.objects.filter(user=request.user).order_by('-created_at')
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def payment_detail(request, payment_id):
    try:
        payment = Payment.objects.get(id=payment_id)
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if payment.user != request.user and not request.user.is_staff:
        return Response({'error': 'Not authorized to view this payment'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = PaymentSerializer(payment)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def update_payment_status(request, payment_id):
    try:
        payment = Payment.objects.get(id=payment_id)
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    new_status = request.data.get('status')
    if new_status not in dict(Payment.STATUS_CHOICES):
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    
    payment.status = new_status
    payment.save()
    
    serializer = PaymentSerializer(payment)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def all_payments(request):
    payments = Payment.objects.all().order_by('-created_at')
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)

def initiate_paynow_payment(payment):
    """
    Initiate a PayNow payment
    This is a mock implementation - in production, integrate with actual PayNow API
    """
    # Mock implementation - replace with actual PayNow integration
    try:
        # In a real implementation, you would:
        # 1. Create a payment request with PayNow
        # 2. Get a payment URL and reference
        # 3. Return these values
        
        return {
            'success': True,
            'reference': f'PNREF{payment.id:08d}',
            'redirect_url': f'https://paynow.example.com/pay/{payment.id}'
        }
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }