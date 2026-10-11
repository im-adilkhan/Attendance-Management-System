from app.models.attendance import Attendance
from app.models.allowed_location import AllowedLocation
from app.models.app_settings import AppSetting
from app.models.course_class import CourseClass
from app.models.department import Department
from app.models.holiday import Holiday
from app.models.leave_request import LeaveRequest
from app.models.notification import Notification
from app.models.student import Student
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.models.user import User

__all__ = ["Attendance", "AllowedLocation", "AppSetting", "CourseClass",
           "Department", "Holiday", "LeaveRequest", "Notification",
           "Student", "Subject", "Teacher", "User"]
