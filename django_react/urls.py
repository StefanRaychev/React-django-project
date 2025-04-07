from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('django_react.common.urls')),
    path('api/lector/', include('django_react.lector_profile.urls')),
    path('api/student/', include('django_react.student_profile.urls')),
    path('api/', include('api.urls')),

]


if settings.DEBUG:  # Only serve media files in development
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)