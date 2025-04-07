from rest_framework import serializers
from django_react.lector_profile.models import NewCourse, Textbook, Homework, StudentCourse
from django_react.accounts.models import CustomUser


class TextbookSerializer(serializers.ModelSerializer):
    file_name = serializers.SerializerMethodField()

    class Meta:
        model = Textbook
        fields = ['id', 'file', 'file_name']

    def get_file_name(self, obj):
        return obj.file_name  # ✅ Calls the @property from your model


class CourseSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.username', read_only=True)  # ✅ add this back
    student_count = serializers.SerializerMethodField()
    students = serializers.SerializerMethodField()  # ✅ new field

    textbook_files = TextbookSerializer(many=True, read_only=True)

    class Meta:
        model = NewCourse
        fields = [
            'id', 'title', 'description', 'author',
            'textbook_files', 'student_count', 'students'  # ✅ include students
        ]

    def get_student_count(self, obj):
        return StudentCourse.objects.filter(course=obj).count()

    def get_students(self, obj):
        # ✅ Return full user info for each student
        student_courses = StudentCourse.objects.filter(course=obj).select_related('student')
        return [
            {
                'id': sc.student.id,
                'username': sc.student.username
            }
            for sc in student_courses
        ]







class HomeworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Homework
        fields = '__all__'


class StudentCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentCourse
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        # Update the rest of the fields normally
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance

