from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import CreateView, UpdateView
from django.urls import reverse_lazy
from django.contrib.auth import views as auth_views
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import login
from django.views.generic.edit import DeleteView
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django_react.accounts.models import CustomUser
from decimal import Decimal, InvalidOperation
from .forms import LectorRegistrationForm, LoginForm, ProfileEditForm, CourseCreationForm
from .models import NewCourse, Textbook, Homework, StudentCourse
from django.contrib.auth.views import LogoutView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login
from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from api.serializers import UserSerializer
from api.serializers import CourseSerializer
from rest_framework.parsers import MultiPartParser, FormParser

class LectorRegisterAPIView(APIView):
    def post(self, request):
        data = request.data
        print(f"📥 Incoming data: {data}")

        username = data.get("username")
        email = data.get("email")
        password1 = data.get("password1")
        password2 = data.get("password2")

        if not username or not email or not password1 or not password2:
            return Response({"error": "All fields are required."}, status=400)

        if password1 != password2:
            return Response({"error": "Passwords do not match."}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password1)
        user.role = "lector"
        user.save()

        login(request, user)  # Log in immediately

        return Response({
            "user": {
                "username": user.username,
                "role": user.role
            }
        }, status=201)


class LectorLoginAPIView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            token, _ = Token.objects.get_or_create(user=user)  # 🔥 create token

            return Response({
                "user": {
                    "username": user.username,
                    "role": "lector"
                },
                "token": token.key  # 🔥 include token in response
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def lector_profile_api_view(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def lector_profile_delete(request):
    user = request.user
    user.delete()
    return Response({'detail': 'Profile deleted successfully'})



@api_view(['POST', 'GET', 'PUT'])
@permission_classes([IsAuthenticated])
def create_course(request):
    user = request.user
    serializer = CourseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(author=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_courses(request):
    user = request.user
    courses = NewCourse.objects.filter(author=user)
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_courses(request):
    courses = NewCourse.objects.all().select_related('author')
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_detail(request, id):
    try:
        course = NewCourse.objects.get(pk=id)
    except NewCourse.DoesNotExist:
        return Response({'detail': 'Course not found'}, status=404)

    # Log related textbooks
    textbooks = course.textbook_files.all()
    print(f"📘 Found {textbooks.count()} textbook(s) for this course:")
    for tb in textbooks:
        print(f"   🔹 {tb.file.name} (id={tb.id})")

    serializer = CourseSerializer(course)
    print(f"📦 Serialized course data:", serializer.data)
    return Response(serializer.data)


@api_view(['POST', 'GET', 'PUT'])
@permission_classes([IsAuthenticated])
def edit_course(request, pk):
    print("✅ Reached API view: edit_course")
    print("📥 Incoming request method:", request.method)
    print("🧾 Headers:", request.headers)
    print("🔐 Authenticated user:", request.user)

    try:
        course = NewCourse.objects.get(pk=pk, author=request.user)
        print(f"🔍 Found course with ID {pk} for user {request.user.username}")
    except NewCourse.DoesNotExist:
        print(f"❌ Course with ID {pk} not found or not owned by {request.user.username}")
        return Response({'error': 'Course not found'}, status=404)

    if request.method == 'GET':
        serializer = CourseSerializer(course)
        print("📤 Returning course data (GET):", serializer.data)
        return Response(serializer.data)

    elif request.method == 'PUT':
        print("📨 Received PUT data:", request.data)
        serializer = CourseSerializer(course, data=request.data, partial=True)

        if serializer.is_valid():
            updated_course = serializer.save(author=request.user)
            print("✅ Course updated successfully:")
            print("   🔹 Title:", updated_course.title)
            print("   🔹 Description:", updated_course.description)

            return Response({
                'success': True,
                'message': 'Course updated successfully',
                'data': serializer.data
            }, status=200)

        else:
            print("❌ Serializer validation failed:", serializer.errors)
            return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_course(request, pk):
    try:
        course = NewCourse.objects.get(pk=pk, author=request.user)
    except NewCourse.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

    course.delete()
    return Response({'message': 'Course deleted successfully'}, status=204)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_textbook_api(request, pk):
    try:
        course = NewCourse.objects.get(pk=pk, author=request.user)
    except NewCourse.DoesNotExist:
        return Response({'error': 'Course not found or unauthorized'}, status=404)

    if 'textbooks' not in request.FILES:
        return Response({'error': 'No file provided'}, status=400)

    for file in request.FILES.getlist('textbooks'):
        Textbook.objects.create(course=course, file=file)

    return Response({'message': 'Textbook(s) uploaded successfully'}, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_textbook_api(request, pk):
    textbook = get_object_or_404(Textbook, pk=pk)

    # Optional: check ownership via textbook.course.author == request.user

    textbook.file.delete(save=False)  # Deletes the file from disk
    textbook.delete()
    return Response({'message': 'Textbook deleted successfully'}, status=204)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_student_homework(request, course_id, student_id):
    try:
        course = NewCourse.objects.get(pk=course_id)
        student = CustomUser.objects.get(pk=student_id)
        print(f"📚 Found course: {course.title} | 👤 Student: {student.username}")
    except (NewCourse.DoesNotExist, CustomUser.DoesNotExist):
        print("❌ Course or student not found.")
        return Response({'error': 'Course or Student not found'}, status=404)

    homeworks = Homework.objects.filter(course=course, student=student)
    print(f"📝 Found {homeworks.count()} homework(s)")

    student_course = StudentCourse.objects.filter(course=course, student=student).first()
    score = student_course.score if student_course else None

    data = [ {
        "id": hw.id,
        "file": hw.file.url,
        "file_name": hw.file_name,
        "score": hw.score,
        "uploaded_at": hw.uploaded_at,
    } for hw in homeworks ]

    print("📦 Sending response payload with:")
    print("  ┗ Course:", course.title)
    print("  ┗ Student:", student.username)
    print("  ┗ Homeworks:", data)

    return Response({
        "student": {
            "id": student.id,
            "username": student.username
        },
        "course": {
            "id": course.id,
            "title": course.title
        },
    "score": score,  # ✅ Send actual saved score
        "homeworks": data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_student_score(request, pk, student_pk):
    print(f"User: {request.user} | Method: {request.method} | Authenticated: {request.user.is_authenticated}")

    course = get_object_or_404(NewCourse, pk=pk)
    student = get_object_or_404(CustomUser, pk=student_pk)

    score = request.data.get('score')  # 🔁 using request.data (if JSON)
    try:
        score = Decimal(score)
    except (InvalidOperation, TypeError):
        return Response({'error': 'Invalid score'}, status=400)

    student_course, created = StudentCourse.objects.get_or_create(
        student=student, course=course
    )
    student_course.score = score
    student_course.save()
    print(f"✅ Updated score for {student.username} in course {course.title}: {score}")

    return Response({'message': 'Score updated successfully'})
"-----------------------"


































def lector_dashboard(request):
    # Fetch all lectors
    lectors = CustomUser.objects.filter(role='lector')

    # Fetch all courses
    courses = NewCourse.objects.all()

    return render(request, 'lector_dashboard.html', {
        'lectors': lectors,
        'courses': courses
    })



def lector_personal_dashboard(request):
    # Fetch all courses created by the logged-in user
    courses = NewCourse.objects.filter(author=request.user)
    return render(request, 'lector_personal_dashboard.html', {'courses': courses})

class LectorLogoutView(LogoutView):
    next_page = reverse_lazy('home-page')

    def get(self, request, *args, **kwargs):
        return self.post(request, *args, **kwargs)  # Allows logout via GET request

class LectorEditView(LoginRequiredMixin, UpdateView):
    model = CustomUser  # Use CustomUser as defined in AUTH_USER_MODEL
    form_class = ProfileEditForm
    template_name = 'lector_profile_edit.html'

    def get_object(self, queryset=None):
        # Fetch the profile of the logged-in user
        return get_object_or_404(CustomUser, pk=self.request.user.pk)

    def form_valid(self, form):
        response = super().form_valid(form)
        # Log the user back in after the profile is updated
        user = form.instance
        login(self.request, user)
        return response

    def get_success_url(self):
        # Redirect to the dashboard after saving changes
        return reverse_lazy('lector_dashboard')


class LectorDeleteView(LoginRequiredMixin, DeleteView):
    model = CustomUser
    template_name = 'lector_profile_delete_confirmation.html'

    def get_object(self, queryset=None):
        # Fetch the profile of the logged-in user
        return get_object_or_404(CustomUser, pk=self.request.user.pk)

    def get_success_url(self):
        # Redirect to the home page after deletion
        return reverse_lazy('home-page')


class CreateCourseView(LoginRequiredMixin, CreateView):
    model = NewCourse
    form_class = CourseCreationForm
    template_name = 'lector_create_course.html'
    success_url = reverse_lazy('lector_personal_dashboard')

    def form_valid(self, form):
        # Automatically assign the logged-in user as the author
        form.instance.author = self.request.user
        return super().form_valid(form)


class EditCourseView(LoginRequiredMixin, UpdateView):
    model = NewCourse
    form_class = CourseCreationForm
    template_name = 'lector_edit_course.html'
    success_url = reverse_lazy('lector_personal_dashboard')

    def get_queryset(self):
        # Restrict editing to courses created by the logged-in user
        queryset = NewCourse.objects.filter(author=self.request.user)
        print(f"Queryset for user {self.request.user}: {queryset}")  # Debug statement
        return queryset

    def get_object(self, queryset=None):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs['pk'])
        print(f"Object fetched: {obj}")  # Debug statement
        return obj


class CourseDeleteView(LoginRequiredMixin, DeleteView):
    model = NewCourse
    template_name = 'lector_course_delete_confirmation.html'

    def get_object(self, queryset=None):
        # Ensure the logged-in user is the author of the course
        queryset = NewCourse.objects.filter(author=self.request.user)
        return get_object_or_404(queryset, pk=self.kwargs['pk'])

    def get_success_url(self):
        # Redirect to the dashboard after deletion
        return reverse_lazy('lector_personal_dashboard')


class LectorCourseDetailView(LoginRequiredMixin, View):
    def get(self, request, pk):
        # Fetch the course object based on the pk (primary key)
        course = get_object_or_404(NewCourse, pk=pk, author=request.user)

        # Render the course detail page for the lector
        return render(request, 'lector_course_detail.html', {'course': course})


@csrf_exempt
def upload_textbook(request, pk):
    course = get_object_or_404(NewCourse, pk=pk, author=request.user)
    if request.method == 'POST' and request.FILES.getlist('textbooks'):
        for file in request.FILES.getlist('textbooks'):
            Textbook.objects.create(course=course, file=file)
        # Optionally, set the first uploaded file as the primary textbook
        if not course.textbooks:
            course.textbooks = request.FILES.getlist('textbooks')[0]
            course.save()
    return redirect('lector-course-detail', pk=pk)

@csrf_exempt
def delete_textbook(request, pk):
    textbook = get_object_or_404(Textbook, pk=pk)
    if request.method == 'POST':
        textbook.file.delete()
        textbook.delete()
    return redirect('lector-course-detail', pk=textbook.course.pk)

'''
def all_dashboard(request):
    # Fetch all courses (not filtered by user)
    courses = NewCourse.objects.all()
    return render(request, 'lector_dashboard.html', {'courses': courses})


def view_student_homework(request, course_id, student_id):
    course = get_object_or_404(NewCourse, pk=course_id)
    student = get_object_or_404(CustomUser, pk=student_id)

    # Fetch the student's homework for the specific course
    homeworks = Homework.objects.filter(course=course, student=student)
    has_homework = homeworks.exists()

    # Fetch the student-course relationship and retrieve the score
    student_course = StudentCourse.objects.filter(course=course, student=student).first()
    score = None
    if student_course:
        score = student_course.score
        print(f"Retrieved score for student {student.username} in course {course.title}: {score}")
    print(f"Context passed to template: {{ 'score': {score} }}")

    return render(request, 'student_homework.html', {
        'course': course,
        'student': student,
        'homeworks': homeworks,
        'has_homework': has_homework,
        'score': score,  # Pass the current score to the template
    })
'''
'''
def update_student_score(request, pk, student_pk):
    course = get_object_or_404(NewCourse, pk=pk)
    student = get_object_or_404(CustomUser, pk=student_pk)

    if request.method == 'POST':
        score = request.POST.get('score')

        try:
            # Validate the score
            score = Decimal(score)
        except InvalidOperation:
            score = None  # Handle invalid input gracefully

        if score is not None:
            # Fetch or create the student-course relationship
            student_course, created = StudentCourse.objects.get_or_create(
                student=student, course=course
            )
            # Update the score
            student_course.score = score
            student_course.save()
            print(f"Updated score for {student.username} in course {course.title}: {score}")

    # Redirect to ensure updated data is displayed
    return redirect('view-student-homework', course_id=course.pk, student_id=student.pk)
'''