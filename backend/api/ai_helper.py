import json
import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def generate_questions(topic, difficulty, num_questions):
    """
    Calls the Groq REST API (OpenAI-compatible) to generate multiple-choice questions.
    """
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set in the environment.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    Generate {num_questions} multiple choice questions about {topic} at a {difficulty} difficulty level.
    Return ONLY a raw JSON array. No markdown, no code blocks, no explanation.
    Each object must have: question, a, b, c, d, answer (where answer is 'a', 'b', 'c', or 'd'). 
    Example format:
    [{{"question": "...", "a": "...", "b": "...", "c": "...", "d": "...", "answer": "a"}}]
    """

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {
                "role": "system",
                "content": "You are a quiz assistant that only outputs raw JSON arrays."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.5
    }

    try:
        # Create a session and disable proxy detection (trust_env=False)
        # to avoid WinError 10061 Connection Refused in some local environments.
        session = requests.Session()
        session.trust_env = False
        
        response = session.post(GROQ_URL, headers=headers, json=payload, timeout=30)
        
        if response.status_code != 200:
            print(f"DEBUG: Groq API Error: {response.status_code} - {response.text}")
            raise Exception(f"Groq API returned error {response.status_code}: {response.text}")
            
        result = response.json()
        
        try:
            # Groq returns OpenAI format
            raw = result['choices'][0]['message']['content'].strip()
        except (KeyError, IndexError) as e:
            print(f"DEBUG: Unexpected Groq response structure: {result}")
            raise Exception(f"Unexpected response structure from Groq API: {e}")

        print(f"DEBUG: Raw Groq response: {raw}")
        
        # Strip markdown if present
        raw = raw.replace("```json", "").replace("```", "").strip()
        
        data = json.loads(raw)
        
        if not isinstance(data, list):
            raise ValueError("Parsed JSON is not a list")
            
        return data

    except json.JSONDecodeError as e:
        print(f"DEBUG: JSONDecodeError: {str(e)} | Raw response: {raw}")
        raise Exception(f"Groq parse error: {str(e)} | Raw response: {raw}")
    except requests.exceptions.RequestException as e:
        print(f"DEBUG: RequestException: {str(e)}")
        raise Exception(f"Error communicating with Groq REST API: {str(e)}")
    except Exception as e:
        print(f"DEBUG: General error in AI helper: {str(e)}")
        raise Exception(f"General error in AI helper: {str(e)}")
