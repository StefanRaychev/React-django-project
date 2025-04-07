from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

User = get_user_model()

class LectorRegisterAPIView(APIView):
    def post(self, request):
        data = request.data
        username = data.get("username")
        email = data.get("email")
        password1 = data.get("password1")
        password2 = data.get("password2")
        print("Incoming registration data:", request.data)  # ✅ log incoming data

        if password1 != password2:
            return Response({"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=email, password=password1)
        user.save()

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=400)

        return Response({"message": "Lector registered successfully."}, status=status.HTTP_201_CREATED)






@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({"message": "CSRF cookie set"})