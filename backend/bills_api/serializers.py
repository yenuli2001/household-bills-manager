from rest_framework import serializers
from .models import Bill

class BillSerializer(serializers.ModelSerializer):
    final_amount = serializers.ReadOnlyField()
    user = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Bill
        fields = ['id', 'bill_type', 'amount', 'discount', 'final_amount', 'date', 'description', 'created_at', 'updated_at', 'user']
    
    def validate_discount(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Discount must be between 0 and 100 percent")
        return value