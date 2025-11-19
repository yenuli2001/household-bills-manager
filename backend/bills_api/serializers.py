from rest_framework import serializers
from .models import Bill, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']

class BillSerializer(serializers.ModelSerializer):
    final_amount = serializers.ReadOnlyField()
    
    class Meta:
        model = Bill
        fields = ['id', 'user', 'bill_type', 'amount', 'discount', 'final_amount', 'date', 'description', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def validate_discount(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Discount must be between 0 and 100 percent")
        return value