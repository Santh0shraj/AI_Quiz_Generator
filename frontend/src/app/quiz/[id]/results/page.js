"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";

export default function QuizResults({ params }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [results, setResults] = useState(null);
  const { id: quizId } = use(params);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    // Read the results saved from the TakeQuiz component's successful submission
    const savedData = sessionStorage.getItem(`quiz_result_${quizId}`);
    if (savedData) {
      setResults(JSON.parse(savedData));
    } else {
      router.push("/history");
    }
  }, [quizId, router]);

  if (loading || !user || !results) return <div className="text-center mt-32 text-gray-500">Loading Results...</div>;

  const percentage = Math.round((results.score / results.total) * 100);
  const passed = percentage >= 60;

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-12">
      {/* Score Summary */}
      <div className="bg-[#111] border border-[#333] rounded-2xl p-10 text-center shadow-2xl relative overflow-hidden">
        {/* Subtle background glow based on pass/fail */}
        <div className={`absolute -top-32 -left-32 w-64 h-64 rounded-full blur-3xl opacity-10 ${passed ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`}></div>
        <div className={`absolute -bottom-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-10 ${passed ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`}></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-white mb-2">Quiz Completed</h1>
          <p className="text-2xl text-gray-400 font-light mb-8">
            You scored <span className="font-bold text-white">{results.score}</span> out of <span className="font-bold text-white">{results.total}</span>
          </p>

          <div className="inline-flex items-center justify-center flex-col scale-110 mb-10">
            <span className={`text-7xl font-black mb-2 ${passed ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
              {percentage}%
            </span>
            <span className={`uppercase tracking-widest text-sm font-bold px-4 py-1 rounded-full ${passed ? "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30" : "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30"}`}>
              {passed ? "Pass" : "Fail"}
            </span>
          </div>
          
          <div className="flex justify-center flex-wrap gap-4 mt-4">
            <Link 
              href="/quiz/create" 
              className="bg-white text-black px-8 py-4 rounded-md font-bold hover:bg-gray-200 transition-colors shadow-lg"
            >
              Create New Quiz
            </Link>
            <Link 
              href="/history" 
              className="bg-[#1a1a1a] border border-[#333] text-white px-8 py-4 rounded-md font-bold hover:bg-[#222] transition-colors"
            >
              View History
            </Link>
          </div>
        </div>
      </div>

      {/* Detailed Review */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-white border-b border-[#333] pb-4">Detailed Review</h3>
        <div className="space-y-6">
          {results.results.map((r, index) => (
            <div 
              key={r.question_id} 
              className="bg-[#111] p-8 rounded-xl border border-[#333]"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                <h4 className="text-xl font-medium text-white leading-relaxed pr-6">
                  <span className="text-gray-500 mr-2">{index + 1}.</span>
                  {r.question_text}
                </h4>
                <div className="mt-4 md:mt-0 flex-shrink-0">
                  {r.is_correct ? (
                    <span className="inline-flex items-center justify-center bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 rounded-full w-10 h-10 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 rounded-full w-10 h-10 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 bg-[#0a0a0a] rounded-lg p-5 border border-[#222]">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Your Answer</span>
                  <div className={`flex items-center text-lg font-semibold ${r.is_correct ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                    <span className="w-8 h-8 rounded bg-[#111] border border-[#333] flex items-center justify-center text-sm mr-3">
                      {r.selected.toUpperCase()}
                    </span>
                    {r.is_correct ? "Correct Match" : "Incorrect"}
                  </div>
                </div>
                
                {!r.is_correct && (
                  <div className="flex flex-col space-y-1 pl-4 md:border-l border-[#333]">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Correct Answer</span>
                    <div className="flex items-center text-lg font-semibold text-[#22c55e]">
                      <span className="w-8 h-8 rounded bg-[#111] border border-[#333] flex items-center justify-center text-sm mr-3 text-white">
                        {r.correct_answer.toUpperCase()}
                      </span>
                      Correct Match
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
