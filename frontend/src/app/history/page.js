"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { apiGetHistory } from "@/lib/api";
import Link from "next/link";

export default function History() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [history, setHistory] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;
      
      const { data, apiError } = await apiGetHistory();
      
      if (apiError) {
        setError(apiError);
      } else if (data && data.history) {
        setHistory(data.history);
      }
      setFetching(false);
    };
    
    loadHistory();
  }, [user]);

  // Handler to easily retake a quiz by passing topic to the create form via query param
  const handleRetake = (topic, difficulty) => {
    const searchParams = new URLSearchParams();
    searchParams.set("topic", topic);
    searchParams.set("difficulty", difficulty);
    router.push(`/quiz/create?${searchParams.toString()}`);
  };

  if (loading || !user || fetching) {
    return (
      <div className="flex justify-center items-center mt-32 min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        <span className="ml-4 text-gray-400 font-medium">Loading history...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-8">
      <div className="flex justify-between items-end border-b border-[#333] pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Quiz History</h1>
          <p className="text-gray-400 text-lg">Review your past performance and retake challenges.</p>
        </div>
        <Link 
          href="/quiz/create" 
          className="bg-white text-black px-6 py-3 rounded-md font-bold hover:bg-gray-200 transition-colors shadow-lg hidden md:block"
        >
          New Quiz +
        </Link>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md mb-8 text-sm font-medium">{error}</div>}

      {history.length === 0 && !error ? (
        <div className="text-center py-20 bg-[#111] rounded-2xl border border-[#333] shadow-lg">
          <div className="w-20 h-20 bg-[#1a1a1a] border border-[#222] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl text-gray-500">
            📚
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No quizzes taken yet.</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">Generate your first AI-powered quiz to start tracking your knowledge progress over time.</p>
          <Link href="/quiz/create" className="bg-white text-black px-8 py-4 rounded-md font-bold hover:bg-gray-200 transition-colors shadow-lg">
            Create Your First Quiz
          </Link>
        </div>
      ) : (
        <div className="bg-[#111] rounded-xl border border-[#333] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 bg-[#0a0a0a] py-5 px-8 text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-[#333]">
            <div className="col-span-12 md:col-span-5">Topic</div>
            <div className="col-span-4 md:col-span-2 text-center">Difficulty</div>
            <div className="col-span-4 md:col-span-2 text-center">Score</div>
            <div className="col-span-4 md:col-span-2 text-center md:text-right">Date</div>
            <div className="hidden md:block md:col-span-1"></div>
          </div>
          
          <div className="divide-y divide-[#222]">
            {history.map((attempt) => {
              const percentage = (attempt.score / attempt.total) * 100;
              const isPassing = percentage >= 60;
              
              return (
                <div key={attempt.attempt_id} className="grid grid-cols-12 py-6 px-8 items-center hover:bg-[#1a1a1a] transition-colors group">
                  <div className="col-span-12 md:col-span-5 mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-white mb-1 truncate pr-4" title={attempt.topic}>{attempt.topic}</h3>
                    <div className="md:hidden flex space-x-4 text-xs mt-2 text-gray-500 uppercase tracking-wider font-semibold">
                       <span>{attempt.difficulty}</span>
                       <span>{new Date(attempt.attempted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="hidden md:block col-span-2 text-center">
                    <span className="bg-[#1a1a1a] border border-[#333] px-3 py-1 rounded-full text-xs uppercase tracking-wider text-gray-300 font-semibold">
                      {attempt.difficulty}
                    </span>
                  </div>
                  
                  <div className="col-span-12 md:col-span-2 text-left md:text-center mt-2 md:mt-0">
                    <div className="text-2xl font-black flex items-center md:justify-center">
                      <span className={isPassing ? "text-[#22c55e]" : "text-[#ef4444]"}>
                        {attempt.score}
                      </span>
                      <span className="text-gray-500 mx-1">/</span>
                      <span className="text-gray-300">{attempt.total}</span>
                    </div>
                  </div>
                  
                  <div className="hidden md:block col-span-2 text-right">
                    <span className="text-sm font-medium text-gray-400">
                      {new Date(attempt.attempted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="col-span-12 md:col-span-1 mt-4 md:mt-0 flex justify-end opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleRetake(attempt.topic, attempt.difficulty)}
                      className="bg-[#222] hover:bg-white hover:text-black text-white border border-[#444] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded transition-colors"
                      title={`Retake quiz on ${attempt.topic}`}
                    >
                      Retake
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
