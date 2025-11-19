from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Bill
from .serializers import BillSerializer
from django.db.models import Sum, Avg
from datetime import datetime

class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    
    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        try:
            # Get current month and year
            today = datetime.now()
            month = int(request.query_params.get('month', today.month))
            year = int(request.query_params.get('year', today.year))
            
            bills = Bill.objects.filter(date__year=year, date__month=month)
            
            # Calculate totals using Python instead of complex database annotations
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
            
            # Calculate total savings
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
                monthly_bills = Bill.objects.filter(date__year=year, date__month=month)
                total = sum(bill.final_amount for bill in monthly_bills)
                monthly_data.append({
                    'month': month,
                    'total': float(total)
                })
            
            return Response(monthly_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)