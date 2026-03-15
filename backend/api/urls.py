from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('me/', views.me, name='me'),
    path('quiz/create/', views.create_quiz, name='create_quiz'),
    path('quiz/history/', views.quiz_history, name='quiz_history'),
    path('quiz/<int:quiz_id>/', views.get_quiz, name='get_quiz'),
    path('quiz/<int:quiz_id>/submit/', views.submit_quiz, name='submit_quiz'),
]
