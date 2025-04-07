from django.urls import path
from django_react.lector_profile import views
from .views import LectorLoginAPIView
from .views import get_my_courses  # ✅ THIS LINE IS MISSING!
from .views import get_all_courses
from .views import get_course_detail
'''
path('create/', views.lecture_profile_create, name='lector-create-profile'),
path('edit/', views.edit_lector_profile, name='lector-edit-profile'),
path('delete/', views.delete_lector_profile, name='lector-delete-profile'),
path('delete/confirm/', views.lector_delete_profile_confirm, name='lector-delete-profile-confirm'),
'''


urlpatterns = [
    path('register/', views.LectorRegisterAPIView.as_view(), name='lector-register'),
    path('login/', LectorLoginAPIView.as_view(), name='lector-login'),





path('profile/', views.lector_profile_api_view, name='lector-profile-api'),
path('profile/', views.lector_profile_delete, name='lector-profile-delete'),
path('courses/create/', views.create_course, name='create-course'),
path('my-courses/', get_my_courses, name='my-courses'),
    path('all-courses/', get_all_courses, name='all-courses'),
    path('courses/<int:id>/', get_course_detail, name='course-detail'),
path('edit-course/<int:pk>/', views.edit_course, name='edit-course'),
path('delete-course/<int:pk>/', views.delete_course, name='delete-course'),
path('api/course/<int:pk>/upload-textbook/', views.upload_textbook_api, name='upload-textbook-api'),
path('textbooks/<int:pk>/', views.delete_textbook_api, name='api-delete-textbook'),
path(
    'lector/course/<int:course_id>/student/<int:student_id>/homeworks/',
    views.view_student_homework,
    name='view-student-homework'
),

    path('course/<int:pk>/student/<int:student_pk>/update-score/', views.update_student_score,
         name='update-student-score'),










    path('edit-course/<int:pk>/', views.EditCourseView.as_view(), name='lector-course-edit'),
    path('course/<int:pk>/upload-textbook/', views.upload_textbook, name='upload-textbook'),
    path('course/<int:pk>/delete-textbook/', views.delete_textbook, name='delete-textbook'),
    path('dashboard/', views.lector_dashboard, name='lector_dashboard'),
    path('logout/', views.LectorLogoutView.as_view(), name='lector-logout'),
    path('edit/', views.LectorEditView.as_view(), name='lector-profile-edit'),
    path('delete/', views.LectorDeleteView.as_view(), name='lector-profile-delete'),
    path('my-dashboard/', views.lector_personal_dashboard, name='lector_personal_dashboard'),
    path('create-course/', views.CreateCourseView.as_view(), name='create-course-page'),
    path('delete-course/<int:pk>/', views.CourseDeleteView.as_view(), name='delete-course'),
    path('course/<int:pk>/', views.LectorCourseDetailView.as_view(), name='lector-course-detail'),
    #path('lector/course/<int:course_id>/student/<int:student_id>/', views.view_student_homework,name='view-student-homework'),

]
