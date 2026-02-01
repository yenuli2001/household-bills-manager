from rest_framework import serializers
from .models import Bill

class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = ['id', 'category', 'amount', 'due_date', 'paid', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']