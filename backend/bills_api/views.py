from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Avg
from datetime import datetime
from .models import Bill, User
from .serializers import BillSerializer, UserSerializer

def get_user_from_token(token):
    try:
        return User.objects.get(token=token)
    except User.DoesNotExist:
        return None

class BillViewSet(viewsets.ModelViewSet):
    serializer_class = BillSerializer

    def get_queryset(self):
        token = self.request.META.get('HTTP_AUTHORIZATION')
        if token:
            user = get_user_from_token(token.replace('Bearer ', ''))
            if user:
                return Bill.objects.filter(user=user)
        return Bill.objects.none()

    def perform_create(self, serializer):
        token = self.request.META.get('HTTP_AUTHORIZATION')
        if token:
            user = get_user_from_token(token.replace('Bearer ', ''))
            if user:
                serializer.save(user=user)

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        try:
            token = request.META.get('HTTP_AUTHORIZATION')
            user = get_user_from_token(token.replace('Bearer ', '')) if token else None
            if not user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

            today = datetime.now()
            month = int(request.query_params.get('month', today.month))
            year = int(request.query_params.get('year', today.year))
            
            bills = Bill.objects.filter(user=user, date__year=year, date__month=month)
            
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
            token = request.META.get('HTTP_AUTHORIZATION')
            user = get_user_from_token(token.replace('Bearer ', '')) if token else None
            if not user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

            year = int(request.query_params.get('year', datetime.now().year))
            
            monthly_data = []
            for month in range(1, 13):
                monthly_bills = Bill.objects.filter(user=user, date__year=year, date__month=month)
                total = sum(bill.final_amount for bill in monthly_bills)
                monthly_data.append({
                    'month': month,
                    'total': float(total)
                })
            
            return Response(monthly_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.decorators import api_view

@api_view(['POST'])
def register_user(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            username=username,
            password=password,  # In real app, hash this!
            email=email
        )

        return Response({
            'message': 'User created successfully',
            'user_id': user.id,
            'username': user.username,
            'token': user.token
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')

        try:
            user = User.objects.get(username=username, password=password)
            return Response({
                'message': 'Login successful',
                'user_id': user.id,
                'username': user.username,
                'token': user.token
            })
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def user_profile(request):
    try:
        token = request.META.get('HTTP_AUTHORIZATION')
        user = get_user_from_token(token.replace('Bearer ', '')) if token else None
        if not user:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = UserSerializer(user)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)