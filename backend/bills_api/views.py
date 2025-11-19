from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from .models import Bill, User
from .serializers import BillSerializer, UserSerializer
from django.db.models import Sum, Avg
from datetime import datetime
import hashlib

# Simple password hashing
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@api_view(['POST'])
def register(request):
    email = request.data.get('email')
    password = request.data.get('password')
    name = request.data.get('name')
    
    if not email or not password or not name:
        return Response({
            'success': False,
            'message': 'Email, password, and name are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user already exists
    if User.objects.filter(email=email).exists():
        return Response({
            'success': False,
            'message': 'User already exists'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create new user
    user = User.objects.create(
        email=email,
        password=hash_password(password),
        name=name
    )
    
    return Response({
        'success': True,
        'message': 'User registered successfully',
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name
        }
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({
            'success': False,
            'message': 'Email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        if user.password == hash_password(password):
            return Response({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)

class BillViewSet(viewsets.ModelViewSet):
    serializer_class = BillSerializer
    
    def get_queryset(self):
        # Only return bills for the logged-in user
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return Bill.objects.filter(user_id=user_id)
        return Bill.objects.none()
    
    def perform_create(self, serializer):
        # Automatically assign user to new bills
        user_id = self.request.data.get('user_id')
        user = User.objects.get(id=user_id)
        serializer.save(user=user)
    
    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        try:
            user_id = request.query_params.get('user_id')
            month = int(request.query_params.get('month', datetime.now().month))
            year = int(request.query_params.get('year', datetime.now().year))
            
            if not user_id:
                return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            bills = Bill.objects.filter(user_id=user_id, date__year=year, date__month=month)
            
            # Calculate totals using Python
            def get_type_total(bill_type):
                type_bills = bills.filter(bill_type=bill_type)
                return sum(bill.final_amount for bill in type_bills)
            
            summary = {
                'total_electricity': get_type_total('ELECTRICITY'),
                'total_water': get_type_total('WATER'),
                'total_grocery': get_type_total('GROCERY'),
                'total_banking': get_type_total('BANKING'),
                'total_loan': get_type_total('LOAN'),
                'total_credit_card': get_type_total('CREDIT_CARD'),
                'total_phone': get_type_total('PHONE'),
                'total_wifi': get_type_total('WIFI'),
                'total_fuel': get_type_total('FUEL'),
                'total_vehicle_repair': get_type_total('VEHICLE_REPAIR'),
                'total_other': get_type_total('OTHER'),
                'total_all': sum(bill.final_amount for bill in bills),
                'average_discount': float(bills.aggregate(avg=Avg('discount'))['avg'] or 0),
                'original_total_all': float(bills.aggregate(total=Sum('amount'))['total'] or 0),
            }
            
            summary['total_savings'] = summary['original_total_all'] - summary['total_all']
            
            return Response(summary)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def yearly_overview(self, request):
        try:
            user_id = request.query_params.get('user_id')
            year = int(request.query_params.get('year', datetime.now().year))
            
            if not user_id:
                return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            monthly_data = []
            for month in range(1, 13):
                monthly_bills = Bill.objects.filter(user_id=user_id, date__year=year, date__month=month)
                total = sum(bill.final_amount for bill in monthly_bills)
                monthly_data.append({
                    'month': month,
                    'total': float(total)
                })
            
            return Response(monthly_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)