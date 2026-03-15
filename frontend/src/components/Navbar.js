"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <nav className="border-b border-[#333] bg-[#0a0a0a]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight">
          AI Quiz App
        </Link>
        <div className="flex items-center space-x-6">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/history" className="text-gray-300 hover:text-white transition-colors">
                    History
                  </Link>
                  <button 
                    onClick={logout}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors">
                    Register
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
