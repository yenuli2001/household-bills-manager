from django.contrib import admin
from .models import Bill

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ['bill_type', 'amount', 'discount', 'final_amount', 'date']
    list_filter = ['bill_type', 'date']
    search_fields = ['description']