"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { apiGetQuiz, apiSubmitQuiz } from "@/lib/api";

export default function TakeQuiz({ params }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);

  const { id: quizId } = use(params);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    const loadQuiz = async () => {
      if (!user || !quizId) return;
      const { data, error: apiError } = await apiGetQuiz(quizId);
      if (apiError) setError(apiError);
      else if (data) {
        setQuiz(data);
        setQuestions(data.questions || []);
      }
      setFetching(false);
    };
    loadQuiz();
  }, [user, quizId]);

  const handleOptionSelect = (questionId, optionKey) => {
    // Only allow selecting if not submitting
    if (submitting) return;

    // Record the explicit choice
    setAnswers(prev => ({ ...prev, [questionId]: optionKey }));
    
    // Automatically advance to the next question if this is not the last one
    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 500); // 0.5s delay as requested
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    // Ensure all questions are answered before submitting
    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer all questions before submitting.");
      setSubmitting(false);
      return;
    }

    // Format answers array: [{ question_id: 1, selected: 'b' }]
    const formattedAnswers = Object.entries(answers).map(([key, value]) => ({
      question_id: parseInt(key),
      selected: value,
    }));

    const { data, error: apiError } = await apiSubmitQuiz(quizId, formattedAnswers);
    
    if (apiError) {
      setError(apiError);
      setSubmitting(false);
    } else if (data) {
      sessionStorage.setItem(`quiz_result_${quizId}`, JSON.stringify(data));
      router.push(`/quiz/${quizId}/results`);
    }
  };

  if (loading || !user || fetching) {
    return (
      <div className="flex justify-center items-center mt-32 min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        <span className="ml-4 text-gray-400 font-medium">Loading your quiz...</span>
      </div>
    );
  }
  
  if (!quiz || questions.length === 0) {
    return <div className="text-center mt-32 text-red-400 text-xl font-medium">Quiz not found or empty.</div>;
  }

  const currentQuestion = questions[currentIndex];
  const progressPercentage = ((currentIndex) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto mt-6 min-h-[70vh] flex flex-col">
      {/* Progress Header */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-3 font-semibold text-gray-400">
          <span className="text-sm tracking-wider uppercase">Question {currentIndex + 1} of {questions.length}</span>
          <span className="text-xs">{quiz.topic}</span>
        </div>
        
        {/* Progress Bar Container */}
        <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden">
          {/* Active Progress Fill */}
          <div 
            className="h-full bg-white transition-all duration-500 ease-in-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md mb-8 text-sm text-center font-medium">{error}</div>}

      {/* Active Question Display */}
      <div className="flex-grow flex flex-col animate-fadeIn">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-snug">
          {currentQuestion.question_text}
        </h2>
        
        <div className="space-y-4">
          {['a', 'b', 'c', 'd'].map((opt) => {
             const isSelected = answers[currentQuestion.id] === opt;
             return (
              <button 
                key={opt} 
                onClick={() => handleOptionSelect(currentQuestion.id, opt)}
                disabled={submitting}
                className={`w-full flex items-center p-5 rounded-xl border text-left transition-all duration-200 group
                  ${isSelected
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    : "bg-[#111] border-[#333] hover:border-white text-gray-200"
                  }
                `}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-md font-bold mr-6 text-sm flex-shrink-0 transition-colors
                  ${isSelected ? "bg-black text-white" : "bg-[#222] text-gray-400 group-hover:bg-[#333] group-hover:text-white"}
                `}>
                  {opt.toUpperCase()}
                </div>
                <span className="text-lg font-medium">{currentQuestion[`option_${opt}`]}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Footer / Submit Area */}
      <div className="mt-12 pt-6 flex justify-end">
        {currentIndex === questions.length - 1 && Object.keys(answers).length === questions.length && (
          <button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="bg-white text-black font-bold uppercase tracking-wide text-sm px-10 py-4 rounded-md hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all animate-[pulse_2s_infinite]"
          >
            {submitting ? "Grading..." : "Submit Quiz Result →"}
          </button>
        )}
      </div>
    </div>
  );
}
