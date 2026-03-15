# AI Fullstack Quiz App

A modern, high-performance fullstack application that generates dynamic, AI-powered quizzes on any topic using the **Groq AI** (Llama 3.3 70B). Users can create accounts, generate quizzes, take them interactively, and track their historical performance.

## Tech Stack
- **Frontend**: Next.js 15 (App Router, JavaScript), Tailwind CSS
- **Backend**: Django REST Framework (DRF)
- **Database**: PostgreSQL (via **Neon** or **Supabase**)
- **AI**: **Groq API** (llama-3.3-70b-versatile) - Ultra-fast inference

## Recent Architectural Improvements
- **Token-Based Authentication**: Transitioned from Sessions to DRF Tokens to ensure reliable cross-origin authentication between the Next.js frontend and Django backend, resolving common CSRF and session persistence issues in local and distributed environments.
- **Groq AI Integration**: Switched to Groq for significantly faster question generation times (sub-second inference) compared to traditional providers.
- **Next.js 15 Compatibility**: Updated dynamic routing to support the new asynchronous `params` API in Next.js 15.
- **Cloud-Ready Configuration**: Pre-configured for seamless deployment to **Render** (Backend) and **Vercel** (Frontend) with dynamic CORS and database URL handling.

## Local Setup Instructions

### 1. Database Setup
The app is configured to use **Neon PostgreSQL**. Ensure you have your `DATABASE_URL` ready.

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
DATABASE_URL=your_neon_or_postgres_url
GROQ_API_KEY=your_groq_api_key_here
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
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Start the Next.js development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Production Deployment Environment Variables

**Backend (e.g., Render)**
- `DATABASE_URL` (Your Neon/Supabase URL)
- `SECRET_KEY` (A secure random string)
- `DEBUG` (Set to `False`)
- `FRONTEND_URL` (Your Vercel App URL)
- `GROQ_API_KEY` (Your Groq API key)

**Frontend (e.g., Vercel)**
- `NEXT_PUBLIC_API_URL` (Your backend API URL, e.g. `https://my-backend.onrender.com/api`)
