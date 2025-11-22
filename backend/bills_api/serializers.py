from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Bill, UserProfile

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', '')
        )
        UserProfile.objects.create(user=user)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'monthly_budget', 'created_at']

class BillSerializer(serializers.ModelSerializer):
    final_amount = serializers.ReadOnlyField()
    
    class Meta:
        model = Bill
        fields = ['id', 'bill_type', 'amount', 'discount', 'final_amount', 'date', 'description', 'created_at', 'updated_at']
    
    def validate_discount(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Discount must be between 0 and 100 percent")
        return value