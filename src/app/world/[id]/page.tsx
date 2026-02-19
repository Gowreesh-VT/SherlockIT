"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [displayedStory, setDisplayedStory] = useState("");
  const [storyComplete, setStoryComplete] = useState(false);

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

  // Typewriter animation for story
  useEffect(() => {
    if (!world?.story) return;

    // If already completed, show full story immediately
    if (world.isCompleted) {
      setDisplayedStory(world.story);
      setStoryComplete(true);
      return;
    }

    let i = 0;
    setDisplayedStory("");
    setStoryComplete(false);

    const timer = setInterval(() => {
      if (i < world.story.length) {
        setDisplayedStory(world.story.slice(0, i + 1));
        i++;
      } else {
        setStoryComplete(true);
        clearInterval(timer);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [world]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || submitting) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/worlds/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worldId: id, answer: answer.trim() }),
      });

      const data = await res.json();

      if (data.correct) {
        setFeedback({
          type: "success",
          message: data.message + (data.nextWorldUnlocked ? ` New world unlocked: ${data.nextWorldTitle}` : ""),
        });
        setWorld((prev) => prev ? { ...prev, isCompleted: true } : prev);
      } else {
        setFeedback({ type: "error", message: data.message });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
      setAnswer("");
    }
  }

  function skipAnimation() {
    if (world) {
      setDisplayedStory(world.story);
      setStoryComplete(true);
    }
  }

  if (loading) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }} />
          <p style={{ color: "var(--text-secondary)" }}>Entering the world...</p>
        </div>
      </div>
    );
  }

  if (!world) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-5xl">❌</div>
          <h2 className="mb-2 text-xl font-semibold">World Not Found</h2>
          <Link href="/dashboard" className="btn-primary mt-4 inline-block">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen pb-24">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          >
            ←
          </Link>
          <div className="flex-1">
            <h2 className="font-bold gradient-text">{world.title}</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              World {world.order} • {world.attempts} attempt{world.attempts !== 1 ? "s" : ""}
            </p>
          </div>
          {world.isCompleted && (
            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: "rgba(0, 200, 83, 0.15)", color: "var(--success)" }}
            >
              ✓ Completed
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-6 pt-8">
        {/* Story Section */}
        <div className="card mb-6 p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h3 className="font-semibold" style={{ color: "var(--text-secondary)" }}>
              The Story
            </h3>
          </div>
          <div
            className="relative text-base leading-relaxed"
            style={{ color: "var(--text-primary)", minHeight: "80px" }}
          >
            <p className="whitespace-pre-wrap">
              {displayedStory}
              {!storyComplete && (
                <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse" style={{ background: "var(--accent-primary)" }} />
              )}
            </p>
            {!storyComplete && (
              <button
                onClick={skipAnimation}
                className="mt-4 text-sm underline"
                style={{ color: "var(--text-muted)" }}
              >
                Skip animation →
              </button>
            )}
          </div>
        </div>

        {/* Question Section */}
        <div className="card mb-6 p-6" style={{ borderColor: "var(--accent-secondary)" }}>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">❓</span>
            <h3 className="font-semibold" style={{ color: "var(--accent-primary)" }}>
              The Question
            </h3>
          </div>
          <p className="text-lg font-medium">{world.question}</p>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className="animate-fade-in-up mb-6 rounded-xl px-5 py-4 text-center font-medium"
            style={{
              background: feedback.type === "success" ? "rgba(0, 200, 83, 0.1)" : "rgba(255, 82, 82, 0.1)",
              border: `1px solid ${feedback.type === "success" ? "var(--success)" : "var(--danger)"}`,
              color: feedback.type === "success" ? "var(--success)" : "var(--danger)",
            }}
          >
            {feedback.message}
          </div>
        )}

        {/* Answer Form */}
        {!world.isCompleted && (
          <form onSubmit={handleSubmit} className="card p-6">
            <div className="mb-4">
              <label
                htmlFor="answer"
                className="mb-2 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Your Answer
              </label>
              <input
                id="answer"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="input-field text-lg"
                required
                autoFocus
                disabled={submitting}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !answer.trim()}
              className="btn-primary w-full py-4 text-lg"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Checking...
                </span>
              ) : (
                "Submit Answer 🔎"
              )}
            </button>
          </form>
        )}

        {/* Completed state */}
        {world.isCompleted && (
          <div className="card p-6 text-center" style={{ borderColor: "var(--success)" }}>
            <div className="mb-3 text-4xl">🎉</div>
            <h3 className="mb-2 text-xl font-bold" style={{ color: "var(--success)" }}>
              World Completed!
            </h3>
            <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
              Great detective work! Head back to explore more worlds.
            </p>
            <Link href="/dashboard" className="btn-primary inline-block">
              ← Back to Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
