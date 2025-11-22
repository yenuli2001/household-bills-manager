from django.db import models
from django.core.validators import MinValueValidator
import secrets

class User(models.Model):
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=100)  # Simple storage for demo
    email = models.EmailField(blank=True)
    monthly_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    token = models.CharField(max_length=100, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

class Bill(models.Model):
    BILL_TYPES = [
        ('ELECTRICITY', 'Electricity'),
        ('WATER', 'Water'),
        ('GROCERY', 'Grocery'),
        ('BANKING', 'Banking'),
        ('LOAN', 'Loan Payment'),
        ('CREDIT_CARD', 'Credit Card Payment'),
        ('PHONE', 'Phone Bill'),
        ('WIFI', 'WiFi Bill'),
        ('FUEL', 'Fuel'),
        ('VEHICLE_REPAIR', 'Vehicle Repairs'),
        ('OTHER', 'Other Expenses'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bill_type = models.CharField(max_length=20, choices=BILL_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    date = models.DateField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def final_amount(self):
        discount_amount = (float(self.amount) * float(self.discount)) / 100
        return float(self.amount) - discount_amount
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.username} - {self.bill_type} - ${self.final_amount:.2f}"