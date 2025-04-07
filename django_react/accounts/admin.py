from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser  # Replace with your actual model


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    pass
