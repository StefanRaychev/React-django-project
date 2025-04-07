from django.urls import path
from django_react.student_profile import views
from .views import StudentRegisterAPIView, StudentLoginAPIView, ApplyToCourseAPIView, StudentMyCoursesAPIView, UploadHomeworkAPIView

urlpatterns = [
    path('register/', StudentRegisterAPIView.as_view(), name='student-register'),
    path('login/', StudentLoginAPIView.as_view(), name='student-login'),


path('profile/', views.student_profile_api_view, name='student-profile-api'),
path('profile/', views.student_profile_delete, name='student-profile-delete'),
path('apply/<int:course_id>/', ApplyToCourseAPIView.as_view(), name='student-apply'),
path('my-courses/', StudentMyCoursesAPIView.as_view(), name='student-my-courses'),
path('course/<int:id>/', views.student_course_detail_api, name='student-course-detail-api'),
path('course/<int:pk>/upload-homework/', UploadHomeworkAPIView.as_view(), name='upload-homework'),

path('homework/<int:pk>/delete/', views.delete_homework_api, name='delete-homework'),
path('remove-applied/<int:course_id>/', views.remove_applied_course, name='remove-applied-course'),







    #path('register/', views.StudentRegisterView.as_view(), name='student-register'),
    path('login/', views.StudentUserLoginView.as_view(), name='student-login'),
    path('dashboard/', views.student_dashboard, name='student-dashboard'),
    path('logout/', views.StudentLogoutView.as_view(), name='student-logout-register'),
    path('student-personal-dashboard/', views.student_personal_dashboard, name='student-personal-dashboard'),
    path('apply/<int:course_id>/', views.apply_to_course, name='apply-to-course'),
    path('my-courses/', views.my_courses, name='student-personal-dashboard'),
    path('course/<int:course_id>/', views.student_course_details, name='course-details'),
    #path('remove/<int:course_id>/', views.remove_course, name='remove-course'),
    #path('course/<int:pk>/upload-homework/', views.upload_homework, name='upload-homework'),
    #path('course/<int:pk>/delete-homework/', views.delete_homework, name='delete-homework'),

    path('edit/', views.StudentEditView.as_view(), name='student-profile-edit-page'),
    path('delete/', views.StudentDeleteView.as_view(), name='student-profile-delete-page'),
]

