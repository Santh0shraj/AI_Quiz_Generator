"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGetHistory } from "@/lib/api";
import Link from "next/link";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [history, setHistory] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        const { data } = await apiGetHistory();
        if (data && data.history) {
          // Keep only the 3 most recent
          setHistory(data.history.slice(0, 3));
        }
      }
      setFetching(false);
    };
    fetchHistory();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center mt-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        <span className="ml-3 text-gray-400">Loading your space...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 mt-10">
      <div className="border-b border-[#333] pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Welcome back, {user.username}</h1>
        <p className="text-gray-400 text-lg">Ready to master a new topic?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link 
          href="/quiz/create" 
          className="bg-[#111] p-8 rounded-xl border border-[#333] group hover:border-gray-500 transition-all flex flex-col justify-center items-center text-center shadow-lg"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="text-black text-3xl font-black">+</span>
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-white">Create New Quiz</h2>
          <p className="text-gray-400">Generate an AI-powered quiz instantly</p>
        </Link>
        
        <Link 
          href="/history" 
          className="bg-[#111] p-8 rounded-xl border border-[#333] group hover:border-gray-500 transition-all flex flex-col justify-center items-center text-center shadow-lg"
        >
          <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-white">View History</h2>
          <p className="text-gray-400">Review all your past quiz attempts</p>
        </Link>
      </div>

      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-white">Recent Attempts</h3>
          <Link href="/history" className="text-sm text-gray-400 hover:text-white transition-colors">View all &rarr;</Link>
        </div>

        {fetching ? (
          <div className="text-gray-500 text-sm py-4">Fetching activity...</div>
        ) : history.length === 0 ? (
          <div className="bg-[#111] border border-[#333] rounded-lg p-8 text-center text-gray-400">
            You haven&apos;t taken any quizzes yet.
          </div>
        ) : (
          <div className="bg-[#111] border border-[#333] rounded-lg overflow-hidden flex flex-col shadow-lg">
            <div className="grid grid-cols-12 bg-black py-4 px-6 text-sm font-semibold text-gray-400 border-b border-[#333] uppercase tracking-wider">
              <div className="col-span-6">Topic</div>
              <div className="col-span-3 text-center">Score</div>
              <div className="col-span-3 text-right">Date</div>
            </div>
            {history.map((record) => (
              <div key={record.attempt_id} className="grid grid-cols-12 py-5 px-6 items-center border-b border-[#222] last:border-0 hover:bg-[#1a1a1a] transition-colors">
                <div className="col-span-6 font-medium text-white truncate pr-4">{record.topic}</div>
                <div className="col-span-3 text-center font-bold">
                  <span className={record.score / record.total >= 0.7 ? "text-green-400" : (record.score / record.total >= 0.5 ? "text-yellow-400" : "text-red-400")}>
                    {record.score}
                  </span>
                  <span className="text-gray-500"> / {record.total}</span>
                </div>
                <div className="col-span-3 text-right text-sm text-gray-500">
                  {new Date(record.attempted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
