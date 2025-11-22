from rest_framework import serializers
from .models import Bill
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

class BillSerializer(serializers.ModelSerializer):
    final_amount = serializers.ReadOnlyField()
    
    class Meta:
        model = Bill
        fields = ['id', 'bill_type', 'amount', 'discount', 'final_amount', 'date', 'description', 'created_at', 'updated_at']
    
    def validate_discount(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Discount must be between 0 and 100 percent")
        return value


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Enter a valid email address")
        return value

    def validate(self, data):
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({
                'password': "Passwords do not match"
            })
        try:
            validate_password(data.get('password'))
        except ValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        if not data.get('password'):
            raise serializers.ValidationError({'password': 'This field is required.'})
        if not data.get('username') and not data.get('email'):
            raise serializers.ValidationError({'non_field_errors': 'Provide username or email.'})
        return data