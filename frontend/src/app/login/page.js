"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { apiLogin } from "@/lib/api";
import Link from "next/link";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const { data, error: apiError } = await apiLogin(username, password);
    
    if (apiError) {
      setError(apiError);
      setLoading(false);
    } else {
      login(data);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 bg-[#111] p-10 rounded-xl border border-[#222] shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-gray-400">Log in to your account</p>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md mb-6 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Username</label>
          <input 
            type="text" 
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
          <input 
            type="password" 
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-white text-black font-semibold py-3 rounded-md hover:bg-gray-200 transition-colors mt-2"
        >
          {loading ? "Logging in..." : "Submit"}
        </button>
      </form>
      
      <p className="mt-8 text-center text-sm text-gray-400">
        Don&apos;t have an account? <Link href="/register" className="text-white hover:text-gray-200 underline underline-offset-4">Register</Link>
      </p>
    </div>
  );
}
