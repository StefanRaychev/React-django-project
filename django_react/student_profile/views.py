from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import CreateView, UpdateView
from django.urls import reverse_lazy
from django.contrib.auth import views as auth_views
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import login
from django.views.generic.edit import DeleteView
from django_react.accounts.models import CustomUser
from django_react.lector_profile.models import NewCourse, Homework, StudentCourse
from django.contrib.auth.decorators import login_required

from .forms import StudentRegistrationForm, StudentLoginForm, StudentProfileEditForm
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import login
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from api.serializers import UserSerializer
from api.serializers import CourseSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from django_react.lector_profile.models import NewCourse, StudentCourse  # ✅ adjust if needed
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


User = get_user_model()


class StudentRegisterAPIView(APIView):
    def post(self, request):
        print("📥 REACHED STUDENT API VIEW")
        print("📦 request.data:", request.data)
        data = request.data
        print("📥 Incoming student data:", data)

        username = data.get("username")
        email = data.get("email")
        password1 = data.get("password1")
        password2 = data.get("password2")

        # Basic validations
        if not username or not email or not password1 or not password2:
            return Response({"error": "All fields are required."}, status=400)

        if password1 != password2:
            return Response({"error": "Passwords do not match."}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password1)
        user.role = "student"
        user.save()

        login(request, user)  # Log in immediately

        return Response({
            "user": {
                "username": user.username,
                "role": user.role
            }
        }, status=201)




class StudentLoginAPIView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                "user": {
                    "username": user.username,
                    "role": "student"
                },
                "token": token.key
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)




@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def student_profile_api_view(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def student_profile_delete(request):
    user = request.user
    user.delete()
    return Response({'detail': 'Profile deleted successfully'})




@method_decorator(csrf_exempt, name='dispatch')
class ApplyToCourseAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        print("📥 API HIT: Student applying to course", course_id)
        # your logic here
        student = request.user
        try:
            course = NewCourse.objects.get(id=course_id)

            # Prevent duplicates
            if StudentCourse.objects.filter(student=student, course=course).exists():
                return Response({'message': 'Already applied.'}, status=200)

            StudentCourse.objects.create(student=student, course=course)
            print(f"✅ {student.username} applied to {course.title}")
            return Response({'message': 'Applied successfully'}, status=201)

        except NewCourse.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)



class StudentMyCoursesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user
        enrolled = StudentCourse.objects.filter(student=student)
        courses = [sc.course for sc in enrolled]
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_course_detail_api(request, id):
    course = get_object_or_404(NewCourse, pk=id)
    student = request.user

    # Score from StudentCourse
    student_course = StudentCourse.objects.filter(course=course, student=student).first()
    score = student_course.score if student_course else None

    # Textbooks
    textbooks = course.textbook_files.all()
    textbook_data = [{
        "id": tb.id,
        "file": tb.file.url,
        "file_name": tb.file_name
    } for tb in textbooks]

    # Homeworks
    homeworks = Homework.objects.filter(course=course, student=student)
    homework_data = [{
        "id": hw.id,
        "file": hw.file.url,
        "file_name": hw.file_name
    } for hw in homeworks]

    return Response({
        "course": {
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "author": {
                "id": course.author.id,
                "username": course.author.username
            },
            "textbook_files": textbook_data,
        },
        "score": score,
        "homeworks": homework_data
    })

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView

class UploadHomeworkAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        print("📥 UploadHomeworkAPIView triggered")
        print("➡️ Files received:", request.FILES)
        print("➡️ User:", request.user)

        student = request.user

        try:
            course = NewCourse.objects.get(pk=pk)
            print("✅ Course found:", course.title)
        except NewCourse.DoesNotExist:
            print("❌ Course not found")
            return Response({'error': 'Course not found'}, status=404)

        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            print("❌ No file uploaded")
            return Response({'error': 'No file uploaded'}, status=400)

        # ✅ FIX: include uploaded_by
        Homework.objects.create(
            student=student,
            course=course,
            file=uploaded_file,
            uploaded_by=student  # ✅ This field is required!
        )

        print("✅ Homework saved")
        return Response({'message': 'Homework uploaded successfully'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_homework_api(request, pk):
    print("🔥 DELETE API triggered for homework ID:", pk)
    homework = get_object_or_404(Homework, pk=pk, student=request.user)

    # Delete file from disk
    homework.file.delete(save=False)
    homework.delete()

    return Response({'message': 'Homework deleted successfully'}, status=204)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_applied_course(request, course_id):
    user = request.user
    try:
        student_course = StudentCourse.objects.get(student=user, course_id=course_id)
        student_course.delete()
        return Response({"message": "Successfully removed course application."}, status=200)
    except StudentCourse.DoesNotExist:
        return Response({"error": "Course not found or not applied."}, status=404)








"""
class StudentRegisterView(CreateView):
    model = CustomUser
    form_class = StudentRegistrationForm
    template_name = 'student-registration.html'
    success_url = reverse_lazy('home-page')

    def form_valid(self, form):
        print("🔥 OLD FORM VIEW CALLED")

        response = super().form_valid(form)
        login(self.request, self.object)  # Log the user in after registration
        return response
"""

class StudentUserLoginView(auth_views.LoginView):
    form_class = StudentLoginForm
    template_name = 'student_dashboard.html'
    next_page = reverse_lazy('student-dashboard')

def student_dashboard(request):
    courses = NewCourse.objects.all()  # Fetch all courses

    return render(request, 'student_dashboard.html', {'courses': courses})


def student_personal_dashboard(request):
    # Fetch all courses created by the logged-in user
    courses = NewCourse.objects.filter(author=request.user)
    return render(request, 'student_personal_dashboard.html', {'courses': courses})


class StudentLogoutView(auth_views.LogoutView):
    next_page = reverse_lazy('home-page')

    def get(self, request, *args, **kwargs):
        return self.post(request, *args, **kwargs)  # Allows logout via GET request

class StudentEditView(LoginRequiredMixin, UpdateView):
    model = CustomUser  # Use CustomUser as defined in AUTH_USER_MODEL
    form_class = StudentProfileEditForm
    template_name = 'student-profile-edit-page.html'

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
        return reverse_lazy('student-dashboard')


class StudentDeleteView(LoginRequiredMixin, DeleteView):
    model = CustomUser
    template_name = 'student-profile-delete-confirmation.html'

    def get_object(self, queryset=None):
        # Fetch the profile of the logged-in user
        return get_object_or_404(CustomUser, pk=self.request.user.pk)

    def get_success_url(self):
        # Redirect to the home page after deletion
        return reverse_lazy('home-page')


@login_required
def apply_to_course(request, course_id):
    # Fetch the course the student wants to apply for
    course = get_object_or_404(NewCourse, id=course_id)

    # Add the student to the course's students field
    course.students.add(request.user)

    # Redirect back to the all courses page
    return redirect('student-dashboard')


def my_courses(request):
    # Fetch courses where the logged-in user has applied
    courses = NewCourse.objects.filter(students=request.user)
    return render(request, 'student_personal_dashboard.html', {'courses': courses})


def student_course_details(request, course_id):
    # Get the course by its ID
    course = get_object_or_404(NewCourse, id=course_id)
    student = request.user  # Assuming the logged-in user is the student

    # Fetch the StudentCourse relationship
    student_course = StudentCourse.objects.filter(course=course, student=student).first()
    score = student_course.score if student_course else None

    print(f"Textbooks for course {course.title}: {course.textbooks}")  # Debugging print
    print(f"Score for student {student.username} in course {course.title}: {score}")  # Debugging print

    # Pass both the course and the score to the template
    return render(request, 'course_details.html', {'course': course, 'score': score})


""""
def remove_course(request, course_id):
    # Get the course by its ID
    course = get_object_or_404(NewCourse, id=course_id)

    # Remove the logged-in student from the course's students
    course.students.remove(request.user)

    # Redirect to the student's "My Dashboard"
    return redirect('student-personal-dashboard')
"""

@csrf_exempt
def upload_homework(request, pk):
    course = get_object_or_404(NewCourse, pk=pk)
    if request.method == 'POST' and request.FILES.getlist('homeworks'):
        student_id = request.POST.get('student_id')  # Get the student ID from the form
        student = get_object_or_404(CustomUser, pk=student_id)  # Fetch the student instance
        for file in request.FILES.getlist('homeworks'):
            Homework.objects.create(
                course=course,
                student=student,  # Use the fetched student
                file=file,
                uploaded_by=request.user  # Track the uploader
            )
    return redirect('course-details', course_id=pk)

"""
@csrf_exempt
def delete_homework(request, pk):
    homework = get_object_or_404(Homework, pk=pk)
    if request.method == 'POST':
        homework.file.delete()
        homework.delete()
    return redirect('course-details', course_id=homework.course.pk)
"""