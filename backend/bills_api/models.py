from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings

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
    
    bill_type = models.CharField(max_length=20, choices=BILL_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    date = models.DateField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='bills')
    
    @property
    def final_amount(self):
        discount_amount = (float(self.amount) * float(self.discount)) / 100
        return float(self.amount) - discount_amount
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        username = self.user.username if self.user else 'Unknown'
        return f"{self.bill_type} - ${self.final_amount:.2f} - {self.date} - {username}"