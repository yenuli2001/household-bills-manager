from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q
from datetime import datetime
from .models import Bill
from .serializers import BillSerializer

class BillViewSet(viewsets.ModelViewSet):
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return bills for the logged-in user
        return Bill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user when creating a bill
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        if not month or not year:
            return Response(
                {'error': 'Month and year parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        bills = self.get_queryset().filter(
            due_date__month=month,
            due_date__year=year
        )
        
        total_amount = bills.aggregate(Sum('amount'))['amount__sum'] or 0
        paid_amount = bills.filter(paid=True).aggregate(Sum('amount'))['amount__sum'] or 0
        unpaid_amount = bills.filter(paid=False).aggregate(Sum('amount'))['amount__sum'] or 0
        
        return Response({
            'month': month,
            'year': year,
            'total_bills': bills.count(),
            'total_amount': float(total_amount),
            'paid_amount': float(paid_amount),
            'unpaid_amount': float(unpaid_amount),
            'bills': BillSerializer(bills, many=True).data
        })

    @action(detail=False, methods=['get'])
    def yearly_overview(self, request):
        year = request.query_params.get('year')
        
        if not year:
            return Response(
                {'error': 'Year parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        bills = self.get_queryset().filter(due_date__year=year)
        
        monthly_data = []
        for month in range(1, 13):
            month_bills = bills.filter(due_date__month=month)
            total = month_bills.aggregate(Sum('amount'))['amount__sum'] or 0
            paid = month_bills.filter(paid=True).aggregate(Sum('amount'))['amount__sum'] or 0
            
            monthly_data.append({
                'month': month,
                'total_amount': float(total),
                'paid_amount': float(paid),
                'unpaid_amount': float(total - paid),
                'bills_count': month_bills.count()
            })
        
        return Response({
            'year': year,
            'monthly_data': monthly_data,
            'total_amount': float(bills.aggregate(Sum('amount'))['amount__sum'] or 0)
        })