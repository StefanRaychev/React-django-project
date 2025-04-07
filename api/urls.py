from django.urls import path
from .views import LectorRegisterAPIView, get_csrf_token  # 👈 add this import

urlpatterns = [
    path('lector/register/', LectorRegisterAPIView.as_view(), name='lector-register'),
    path('csrf/', get_csrf_token, name='get-csrf'),  # 👈 add this line

]
