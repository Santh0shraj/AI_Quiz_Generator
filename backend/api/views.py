import json
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect, csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # CSRF check bypassed for these views

from .models import Quiz, Question, QuizAttempt, UserAnswer
from .ai_helper import generate_questions

# --- Auth Endpoints ---

@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication, BasicAuthentication, TokenAuthentication])
@permission_classes([AllowAny])
@csrf_exempt
def register(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not password or not email:
        return Response({'error': 'Username, email, and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication, BasicAuthentication, TokenAuthentication])
@permission_classes([AllowAny])
@csrf_exempt
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'Login successful', 
            'username': user.username,
            'token': token.key
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication, BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
@csrf_exempt
def logout_view(request):
    logout(request)
    return Response({'message': 'Logged out'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({
        'username': request.user.username,
        'id': request.user.id
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def set_csrf_token(request):
    return Response({'message': 'CSRF cookie set'})

# --- Quiz Endpoints ---

@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication, BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
@csrf_exempt
def create_quiz(request):
    try:
        topic = request.data.get('topic')
        difficulty = request.data.get('difficulty')
        num_questions = request.data.get('num_questions')

        if not all([topic, difficulty, num_questions]):
            return Response({'error': 'topic, difficulty, and num_questions are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            num_questions = int(num_questions)
            if num_questions <= 0 or num_questions > 20: 
                return Response({'error': 'num_questions must be between 1 and 20'}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({'error': 'num_questions must be an integer'}, status=status.HTTP_400_BAD_REQUEST)

        if difficulty not in ['easy', 'medium', 'hard']:
             return Response({'error': 'difficulty must be easy, medium, or hard'}, status=status.HTTP_400_BAD_REQUEST)

        # Call AI Helper
        generated_data = generate_questions(topic, difficulty, num_questions)

        # Save Quiz to DB
        quiz = Quiz.objects.create(
            user=request.user,
            topic=topic,
            difficulty=difficulty,
            num_questions=len(generated_data)
        )

        questions_to_return = []
        
        # Save Questions to DB
        for item in generated_data:
            question = Question.objects.create(
                quiz=quiz,
                question_text=item.get('question'),
                option_a=item.get('a'),
                option_b=item.get('b'),
                option_c=item.get('c'),
                option_d=item.get('d'),
                correct_option=item.get('answer').lower()
            )
            questions_to_return.append({
                'id': question.id,
                'question_text': question.question_text,
                'option_a': question.option_a,
                'option_b': question.option_b,
                'option_c': question.option_c,
                'option_d': question.option_d,
            })

        return Response({
            'message': 'Quiz created successfully',
            'quiz_id': quiz.id,
            'topic': quiz.topic,
            'difficulty': quiz.difficulty,
            'questions': questions_to_return
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id)
    questions = Question.objects.filter(quiz=quiz)
    
    questions_data = [{
        'id': q.id,
        'question_text': q.question_text,
        'option_a': q.option_a,
        'option_b': q.option_b,
        'option_c': q.option_c,
        'option_d': q.option_d,
    } for q in questions]

    return Response({
        'quiz_id': quiz.id,
        'topic': quiz.topic,
        'difficulty': quiz.difficulty,
        'num_questions': quiz.num_questions,
        'created_at': quiz.created_at,
        'questions': questions_data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication, BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
@csrf_exempt
def submit_quiz(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id)
    answers_data = request.data.get('answers', [])
    
    if not isinstance(answers_data, list):
         return Response({'error': 'answers must be a list of objects'}, status=status.HTTP_400_BAD_REQUEST)

    questions = Question.objects.filter(quiz=quiz)
    question_map = {q.id: q for q in questions}
    
    score = 0
    total = questions.count()
    results = []

    # Create the attempt first
    attempt = QuizAttempt.objects.create(
        user=request.user,
        quiz=quiz,
        score=0, # Update later
        total=total
    )

    for answer_item in answers_data:
        q_id = answer_item.get('question_id')
        selected = answer_item.get('selected', '').lower()

        if q_id not in question_map:
            continue

        q = question_map[q_id]
        is_correct = selected == q.correct_option

        if is_correct:
            score += 1

        UserAnswer.objects.create(
            attempt=attempt,
            question=q,
            selected_option=selected
        )
        
        results.append({
            'question_id': q.id,
            'question_text': q.question_text,
            'selected': selected,
            'correct_answer': q.correct_option,
            'is_correct': is_correct
        })

    # Update attempt score
    attempt.score = score
    attempt.save()

    return Response({
        'message': 'Quiz submitted',
        'attempt_id': attempt.id,
        'score': score,
        'total': total,
        'results': results
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quiz_history(request):
    attempts = QuizAttempt.objects.filter(user=request.user).order_by('-attempted_at')
    
    attempts_data = [{
        'attempt_id': a.id,
        'quiz_id': a.quiz.id,
        'topic': a.quiz.topic,
        'difficulty': a.quiz.difficulty,
        'score': a.score,
        'total': a.total,
        'attempted_at': a.attempted_at
    } for a in attempts]
    
    return Response({'history': attempts_data}, status=status.HTTP_200_OK)
