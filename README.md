# AI Fullstack Quiz App

A fullstack application that generates dynamic, AI-powered multiple-choice quizzes on any topic using Google's Gemini LLM. Users can create accounts, generate quizzes, take them interactively, and track their historical performance.

## Tech Stack
- **Frontend**: Next.js (App Router, JavaScript), Tailwind CSS
- **Backend**: Django REST Framework
- **Database**: PostgreSQL (via psycopg2)
- **AI**: Google Gemini API (gemini-1.5-flash)

## Architectural Decisions
- **Django Sessions over JWT**: Django's built-in session authentication is robust, secure by default against XSS, and significantly simplifies credential management compared to implementing manual JWT token refresh cycles.
- **Google Gemini API**: Gemini (specifically the 1.5-flash model) offers an incredibly generous free tier while being highly capable of consistently following strict zero-shot JSON output instructions for quiz generation.
- **Folder Structure**: Separating the repository into explicit `/frontend` and `/backend` directories cleanly decouples the architectures, allowing independent scalable deployments (e.g. Vercel for the Next.js frontend and Render for the Django backend).

## Local Setup Instructions

### 1. Database Setup
Ensure you have PostgreSQL installed locally. Create a database for the project:
```sql
CREATE DATABASE quizapp_db;
```

### 2. Backend Setup
Navigate to the backend directory and set up the Python environment:
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `/backend` directory:
```env
DB_NAME=quizapp_db
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_django_secret_key
DEBUG=True
FRONTEND_URL=http://localhost:3000
```

Run migrations and start the server:
```bash
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `/frontend` directory:
```env
# Point this to your backend URL (defaults to localhost:8000 in development if not set)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Start the Next.js development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Production Deployment Environment Variables

**Backend (e.g., Render)**
- `DATABASE_URL` (Provided by Render PostgreSQL)
- `SECRET_KEY` (A secure random string)
- `DEBUG` (Set to `False`)
- `FRONTEND_URL` (The deployed URL of your Next.js app, e.g. `https://my-quiz-app.vercel.app`)
- `GEMINI_API_KEY` (Your Google Gemini API key)

**Frontend (e.g., Vercel)**
- `NEXT_PUBLIC_API_URL` (The deployed URL of your Django backend API, e.g. `https://my-quiz-backend.onrender.com/api`)
