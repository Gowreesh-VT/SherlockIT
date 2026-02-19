"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Wifi,
  Bell,
  Lightbulb,
  Puzzle,
  Key,
  Send,
  CheckCircle,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface WorldData {
  _id: string;
  title: string;
  story: string;
  question: string;
  order: number;
  isCompleted: boolean;
  attempts: number;
}

export default function WorldDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [world, setWorld] = useState<WorldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [displayedStory, setDisplayedStory] = useState("");
  const [storyComplete, setStoryComplete] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Typewriter effect
  useEffect(() => {
    if (!world?.story) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    if (world.isCompleted) {
      setDisplayedStory(world.story);
      setStoryComplete(true);
      return;
    }

    let i = 0;
    setDisplayedStory("");
    setStoryComplete(false);

    intervalRef.current = setInterval(() => {
      if (i < world.story.length) {
        setDisplayedStory(world.story.slice(0, i + 1));
        i++;
      } else {
        setStoryComplete(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 25);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [world]);

  const fetchWorld = useCallback(async () => {
    try {
      const res = await fetch(`/api/worlds/${id}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          router.push("/dashboard");
          return;
        }
        setLoading(false);
        return;
      }

      setWorld(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      fetchWorld();
    }
  }, [status, session, router, fetchWorld]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || submitting) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/worlds/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worldId: id, answer: answer.trim() }),
      });

      const data = await res.json();

      if (data.correct) {
        toast.success(
          data.message +
            (data.nextWorldUnlocked
              ? ` 🌟 New world unlocked: ${data.nextWorldTitle}`
              : "")
        );
        setWorld((prev) => (prev ? { ...prev, isCompleted: true } : prev));
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
      setAnswer("");
    }
  }

  function skipAnimation() {
    if (world) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayedStory(world.story);
      setStoryComplete(true);
    }
  }

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#020617", fontFamily: "var(--font-rajdhani), sans-serif" }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin" style={{ color: "#06b6d4" }} />
          <p className="text-gray-400">Entering the world...</p>
        </div>
      </div>
    );
  }

  if (!world) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "#020617" }}
      >
        <XCircle className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-white">World Not Found</h2>
        <Link href="/dashboard">
          <button
            className="px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-sm cursor-pointer"
            style={{
              backgroundColor: "#06b6d4",
              color: "black",
              fontFamily: "var(--font-orbitron), sans-serif",
            }}
          >
            Back to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="text-white min-h-screen relative overflow-x-hidden antialiased"
      style={{
        backgroundColor: "#020617",
        fontFamily: "var(--font-rajdhani), sans-serif",
      }}
    >
      {/* Background overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617] pointer-events-none" />

      {/* Ambient particles */}
      <div className="fixed top-20 left-4 w-1 h-1 bg-white rounded-full animate-ping opacity-20" />
      <div
        className="fixed bottom-40 right-8 w-1 h-1 rounded-full animate-ping opacity-20"
        style={{ color: "#06b6d4", backgroundColor: "#06b6d4", animationDelay: "0.7s" }}
      />
      <div
        className="fixed top-1/3 right-4 w-24 h-px rotate-45 pointer-events-none"
        style={{ background: "linear-gradient(to left, rgba(6, 182, 212, 0.3), transparent)" }}
      />
      <div
        className="fixed bottom-1/4 left-0 w-32 h-px -rotate-12 pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(139, 92, 246, 0.3), transparent)" }}
      />

      <main className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col px-5 pb-8 pt-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Link href="/dashboard">
            <button className="p-2 rounded-full glass-panel hover:bg-white/10 transition-colors group cursor-pointer">
              <ArrowLeft className="w-5 h-5 group-hover:text-white transition-colors" style={{ color: "#06b6d4" }} />
            </button>
          </Link>
          <div className="flex items-center space-x-2">
            <Wifi className="w-3.5 h-3.5 animate-pulse" style={{ color: "#06b6d4" }} />
            <span
              className="text-xs tracking-widest text-gray-400 uppercase"
              style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
            >
              System Online
            </span>
          </div>
          <Link href="/announcements">
            <button className="p-2 rounded-full glass-panel hover:bg-white/10 transition-colors group relative cursor-pointer">
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <Bell className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
            </button>
          </Link>
        </header>

        {/* Title Section */}
        <section className="mb-6 text-center relative">
          <div
            className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-48 h-48 rounded-full blur-3xl -z-10"
            style={{ backgroundColor: "rgba(6, 182, 212, 0.2)" }}
          />
          <h2
            className="text-xs tracking-[0.3em] uppercase mb-2"
            style={{ fontFamily: "var(--font-orbitron), sans-serif", color: "#06b6d4" }}
          >
            World {world.order} // {world.attempts} Attempt{world.attempts !== 1 ? "s" : ""}
          </h2>
          <h1
            className="text-4xl font-black mb-2"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              background: "linear-gradient(to right, white, #a5f3fc, white)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 10px rgba(6, 182, 212, 0.5))",
            }}
          >
            {world.title.toUpperCase()}
          </h1>
          <div
            className="h-0.5 w-24 mx-auto opacity-70"
            style={{ background: "linear-gradient(to right, transparent, #06b6d4, transparent)" }}
          />
        </section>

        {/* Progress Bar */}
        <div
          className="mb-8 flex items-center justify-between text-xs text-gray-400"
          style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
        >
          <span>Progress</span>
          <div className="flex-1 mx-4 h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <div
              className="h-full rounded-full"
              style={{
                width: world.isCompleted ? "100%" : "50%",
                background: "linear-gradient(to right, #8b5cf6, #06b6d4)",
                boxShadow: "0 0 15px rgba(6, 182, 212, 0.5)",
              }}
            />
          </div>
          <span style={{ color: "#06b6d4" }}>{world.isCompleted ? "100%" : "In Progress"}</span>
        </div>

        {/* Story Section */}
        <section className="mb-8 relative group">
          <div
            className="absolute -inset-0.5 rounded-xl opacity-30 blur group-hover:opacity-50 transition duration-500"
            style={{ background: "linear-gradient(to right, #8b5cf6, #06b6d4)" }}
          />
          <div
            className="relative glass-panel rounded-xl p-6"
            style={{ borderLeft: "4px solid #8b5cf6" }}
          >
            <div className="flex items-start mb-3">
              <Puzzle className="w-5 h-5 mr-2 mt-1" style={{ color: "#8b5cf6" }} />
              <h3
                className="text-lg font-bold text-white tracking-wide"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                The Transmission
              </h3>
            </div>
            <div className="text-gray-300 leading-relaxed text-lg space-y-4 relative">
              <p className="whitespace-pre-wrap">
                {displayedStory}
                {!storyComplete && (
                  <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-cyan-400 align-middle" />
                )}
              </p>
              {!storyComplete && (
                <button
                  onClick={skipAnimation}
                  className="text-xs text-gray-500 hover:text-cyan-400 transition-colors absolute -bottom-2 right-0 cursor-pointer"
                >
                  Skip animation →
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Question / Answer Section */}
        <section className="flex-1 flex flex-col justify-end pb-4">
          {!world.isCompleted ? (
            <>
              {/* Question Card */}
              <div
                className="glass-panel rounded-2xl p-6 mb-6 relative overflow-hidden shadow-2xl"
                style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}
              >
                <div className="absolute top-0 right-0 p-3 opacity-20">
                  <Puzzle className="w-16 h-16 rotate-12" style={{ color: "#06b6d4" }} />
                </div>
                <div
                  className="absolute bottom-0 left-0 w-full h-1"
                  style={{ background: "linear-gradient(to right, #8b5cf6, #06b6d4, transparent)" }}
                />
                <div className="relative z-10">
                  <h4
                    className="text-sm mb-2 uppercase tracking-wider flex items-center"
                    style={{ fontFamily: "var(--font-orbitron), sans-serif", color: "#06b6d4" }}
                  >
                    <span
                      className="w-2 h-2 rounded-full mr-2 animate-pulse"
                      style={{ backgroundColor: "#06b6d4" }}
                    />
                    Cipher Challenge
                  </h4>
                  <p
                    className="text-xl font-medium text-white mb-4"
                    style={{ fontFamily: "var(--font-cinzel), serif" }}
                  >
                    {world.question}
                  </p>

                </div>
              </div>

              {/* Answer Form */}
              <form className="space-y-4 relative" onSubmit={handleSubmit}>
                <div className="relative group">
                  <div
                    className="absolute -inset-0.5 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-500 animate-pulse"
                    style={{ background: "linear-gradient(to right, #06b6d4, #0891b2)" }}
                  />
                  <div
                    className="relative rounded-lg flex items-center input-glow transition-all"
                    style={{
                      backgroundColor: "#020617",
                      border: "1px solid rgba(6, 182, 212, 0.5)",
                    }}
                  >
                    <Key className="ml-4 w-5 h-5 text-gray-500" />
                    <input
                      className="w-full bg-transparent border-0 text-white placeholder-gray-600 focus:ring-0 focus:outline-none py-4 px-3 tracking-widest uppercase text-lg"
                      style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
                      placeholder="ENTER DECRYPTION KEY..."
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={submitting}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <button
                  className="w-full relative overflow-hidden group rounded-lg p-[1px] focus:outline-none cursor-pointer"
                  type="submit"
                  disabled={submitting || !answer.trim()}
                >
                  <span
                    className="absolute inset-0 w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(to right, #06b6d4, #8b5cf6, #06b6d4)" }}
                  />
                  <span className="relative block w-full bg-[#020617]/50 group-hover:bg-transparent transition-colors duration-300 rounded-lg py-4">
                    <span
                      className="relative flex items-center justify-center font-bold tracking-widest uppercase text-white text-glow transition-all"
                      style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Decrypting...
                        </>
                      ) : (
                        <>
                          Decrypt & Submit
                          <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </span>
                </button>
              </form>
            </>
          ) : (
            /* Completed State */
            <div
              className="glass-panel rounded-2xl p-8 text-center relative overflow-hidden"
              style={{ border: "1px solid rgba(16, 185, 129, 0.3)" }}
            >
              <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
              <div className="relative z-10">
                <div
                  className="h-16 w-16 flex items-center justify-center rounded-full mx-auto mb-4"
                  style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}
                >
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <h3
                  className="text-2xl font-bold text-emerald-400 mb-2"
                  style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
                >
                  WORLD COMPLETED
                </h3>
                <p className="text-gray-400 mb-6">
                  Great detective work! You&apos;ve solved this mystery.
                </p>
                <Link href="/dashboard">
                  <button
                    className="px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition-all cursor-pointer"
                    style={{
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.5)",
                      color: "#10b981",
                      fontFamily: "var(--font-orbitron), sans-serif",
                    }}
                  >
                    ← Back to Dashboard
                  </button>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer
          className="mt-4 flex justify-between items-end text-[10px] text-gray-600 uppercase tracking-widest pt-3"
          style={{
            fontFamily: "var(--font-orbitron), sans-serif",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div>
            <span className="block text-gray-500">Server</span>
            <span style={{ color: "#06b6d4" }}>Online</span>
          </div>
          <div className="text-right">
            <span className="block text-gray-500">ID</span>
            <span>#SH-{world.order.toString().padStart(3, "0")}-MV</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
