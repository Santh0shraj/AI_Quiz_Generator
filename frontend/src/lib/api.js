const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper to make API calls with credentials
export async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // Get token from localStorage if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('quiz_token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Important for Django session cookies!
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

// Auth API
export const apiRegister = (username, email, password) => 
  fetchApi('/register/', { method: 'POST', body: JSON.stringify({ username, email, password }) });

export const apiLogin = (username, password) => 
  fetchApi('/login/', { method: 'POST', body: JSON.stringify({ username, password }) });

export const apiLogout = () => 
  fetchApi('/logout/', { method: 'POST' });

export const apiGetMe = () => 
  fetchApi('/me/', { method: 'GET' });

// Quiz API
export const apiCreateQuiz = (topic, difficulty, num_questions) => 
  fetchApi('/quiz/create/', { method: 'POST', body: JSON.stringify({ topic, difficulty, num_questions }) });

export const apiGetQuiz = (quizId) => 
  fetchApi(`/quiz/${quizId}/`, { method: 'GET' });

export const apiSubmitQuiz = (quizId, answers) => 
  fetchApi(`/quiz/${quizId}/submit/`, { method: 'POST', body: JSON.stringify({ answers }) });

export const apiGetHistory = () => 
  fetchApi('/quiz/history/', { method: 'GET' });
