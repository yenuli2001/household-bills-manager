from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Avg
from datetime import datetime
from .models import Bill
from .serializers import BillSerializer

class BillViewSet(viewsets.ModelViewSet):
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return bills for the current logged-in user
        return Bill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign the current user to new bills
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        try:
            today = datetime.now()
            month = int(request.query_params.get('month', today.month))
            year = int(request.query_params.get('year', today.year))
            
            # Only get bills for the current user
            bills = Bill.objects.filter(user=request.user, date__year=year, date__month=month)
            
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
            year = int(request.query_params.get('year', datetime.now().year))
            
            monthly_data = []
            for month in range(1, 13):
                # Only get bills for the current user
                monthly_bills = Bill.objects.filter(user=request.user, date__year=year, date__month=month)
                total = sum(bill.final_amount for bill in monthly_bills)
                monthly_data.append({
                    'month': month,
                    'total': float(total)
                })
            
            return Response(monthly_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Google OAuth callback view
@api_view(['POST'])
@permission_classes([])
def google_oauth_callback(request):
    from django.contrib.auth.models import User
    import jwt
    from decouple import config
    
    try:
        token = request.data.get('token')
        
        if not token:
            return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify Google token (in production, use proper verification)
        # For now, we'll decode and trust the token
        decoded = jwt.decode(token, options={"verify_signature": False})
        
        email = decoded.get('email')
        name = decoded.get('name', 'User')
        
        if not email:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create user
        user, created = User.objects.get_or_create(
            username=email,
            defaults={'email': email, 'first_name': name}
        )
        
        # Generate JWT token for the user
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': 'Login successful',
            'user': {
                'email': user.email,
                'name': user.first_name or user.email.split('@')[0],
                'id': user.id
            },
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)