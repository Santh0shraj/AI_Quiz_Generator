"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { apiCreateQuiz } from "@/lib/api";
import Link from "next/link";

function CreateQuizContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [numQuestions, setNumQuestions] = useState("5");
  
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Read URL params for pre-filling "Retake" functionality
  useEffect(() => {
    const prefillTopic = searchParams.get("topic");
    const prefillDiff = searchParams.get("difficulty");
    if (prefillTopic) setTopic(prefillTopic);
    if (prefillDiff) setDifficulty(prefillDiff);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    
    setGenerating(true);
    setError(null);
    
    const { data, error: apiError } = await apiCreateQuiz(topic.trim(), difficulty, Number(numQuestions));
    
    if (apiError) {
      setError(apiError);
      setGenerating(false);
    } else if (data && data.quiz_id) {
      router.push(`/quiz/${data.quiz_id}`);
    }
  };

  if (loading || !user) {
    return <div className="text-center mt-32 text-gray-500">Loading module...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-16 bg-[#111] p-10 rounded-xl border border-[#333] shadow-2xl relative overflow-hidden">
      
      {/* Overlay when loading */}
      {generating && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-6"></div>
          <h3 className="text-xl font-bold text-white mb-2">Generating your quiz with AI...</h3>
          <p className="text-gray-400 text-sm">This usually takes a few seconds based on the topic.</p>
        </div>
      )}

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Quiz</h1>
        <p className="text-gray-400">Specify your parameters, and we&apos;ll do the rest.</p>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md mb-8 text-sm text-center font-medium">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300 tracking-wide uppercase">Topic</label>
          <input 
            type="text" 
            placeholder="e.g. World War 2, Python basics..."
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-lg"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={generating}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300 tracking-wide uppercase">Difficulty</label>
            <div className="relative">
              <select 
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-5 py-4 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white appearance-none transition-all text-lg"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={generating}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300 tracking-wide uppercase">Questions</label>
            <div className="relative">
              <select 
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-5 py-4 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white appearance-none transition-all text-lg"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                disabled={generating}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={generating}
            className="bg-white text-black font-bold uppercase tracking-wide text-sm px-8 py-4 rounded-md hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
          >
            Generate Quiz &rarr;
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateQuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <CreateQuizContent />
    </Suspense>
  );
}
