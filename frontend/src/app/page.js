import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
          AI Quiz App
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 font-light">
          Generate AI-powered quizzes on any topic.
        </p>
        <div className="pt-8">
          <Link 
            href="/register" 
            className="inline-block bg-white text-black px-10 py-4 rounded-md font-semibold text-lg hover:bg-gray-200 transition-all duration-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
