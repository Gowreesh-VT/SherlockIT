"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.teamId) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const handleLogin = () => {
    setLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-white font-body min-h-screen relative overflow-hidden flex flex-col items-center justify-center selection:bg-primary selection:text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 bg-multiverse-gradient pointer-events-none"></div>
      <div className="absolute inset-0 z-0 stars opacity-40 pointer-events-none"></div>
      <div className="absolute top-10 left-[-50px] w-64 h-64 bg-primary/20 rounded-full blur-[80px] z-0"></div>
      <div className="absolute bottom-[-20px] right-[-20px] w-80 h-80 bg-secondary/10 rounded-full blur-[100px] z-0"></div>

      <main className="w-full max-w-md px-6 py-8 relative z-10 flex flex-col items-center animate-fade-in-up">
        {/* Title Section */}
        <div className="mb-8 text-center animate-float">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            SHERLOCK IT
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.3em] text-cyan-200/80 font-semibold border-t border-b border-cyan-500/30 py-1 inline-block">
            Multiverse Edition
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full glass-panel bg-glass-light dark:bg-glass-dark rounded-xl p-8 shadow-2xl relative overflow-hidden group flex flex-col items-center justify-center min-h-[360px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-70"></div>
          
          <div className="w-full flex flex-col items-center">
            <h2 className="text-2xl font-display font-bold text-center mb-10 text-white drop-shadow-md">
              Identity Verification
            </h2>

            <button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full relative overflow-hidden bg-white text-gray-900 font-bold py-3.5 px-4 rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group flex items-center justify-center mb-10 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
              
              {loading ? (
                 <svg className="animate-spin h-5 w-5 mr-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg> 
              ) : (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
              )}
              
              <span className="tracking-widest uppercase text-sm">
                {loading ? "Verifying..." : "Sign in with Google"}
              </span>
            </button>

            <div className="w-full pt-6 border-t border-white/10 flex flex-col items-center justify-center space-y-3">
              <p className="text-xs text-center text-gray-400">
                Having trouble accessing the mainframe?
              </p>
              <button className="text-xs text-secondary hover:text-white transition-colors underline decoration-dotted underline-offset-4">
                Contact Central Command
              </button>
            </div>
          </div>
        </div>

        {/* Footer Logos */}
        <div className="mt-12 w-full flex justify-center items-center space-x-6 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center bg-black/50">
              <span className="font-display font-bold text-xs">MS</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 leading-tight">Microsoft<br />Innovations</span>
          </div>
          <div className="h-6 w-px bg-white/20"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center bg-black/50">
              <span className="font-display font-bold text-xs">VIT</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 leading-tight">Student<br />Welfare</span>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 text-[9px] font-mono text-cyan-500/40 pointer-events-none hidden md:block">
            COORD: 13.0827° N, 80.2707° E<br />
            STATUS: FRACTURED
        </div>
      </main>

      {/* Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>
    </div>
  );
}
