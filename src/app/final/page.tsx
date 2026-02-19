"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SubmissionData {
  realWorld: string;
  villain: string;
  weapon: string;
  submittedAt: string;
}

export default function FinalAnswerPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [realWorld, setRealWorld] = useState("");
  const [villain, setVillain] = useState("");
  const [weapon, setWeapon] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      fetchStatus();
    }
  }, [status, router]);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/final/status");
      const data = await res.json();

      if (res.ok) {
        setIsOpen(data.isOpen);
        setAlreadySubmitted(data.alreadySubmitted);
        setSubmission(data.submission);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  function handleSubmitClick(e: React.FormEvent) {
    e.preventDefault();
    if (!realWorld.trim() || !villain.trim() || !weapon.trim()) {
      setError("All fields are required.");
      return;
    }
    setError("");
    setShowConfirm(true);
  }

  async function confirmSubmit() {
    setSubmitting(true);
    setShowConfirm(false);
    setError("");

    try {
      const res = await fetch("/api/final/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          realWorld: realWorld.trim(),
          villain: villain.trim(),
          weapon: weapon.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setSubmitting(false);
        return;
      }

      setAlreadySubmitted(true);
      setSubmission(data.submission);
      setSubmitting(false);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }} />
          <p style={{ color: "var(--text-secondary)" }}>Checking final answer status...</p>
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
          <div>
            <h2 className="font-bold gradient-text">Final Answer</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              One submission only — choose wisely
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-6 pt-8">
        {/* Not Open */}
        {!isOpen && !alreadySubmitted && (
          <div className="py-16 text-center">
            <div className="mb-4 text-6xl">⏳</div>
            <h3 className="mb-3 text-2xl font-bold">Not Available Yet</h3>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
              The final answer submission will open during the last 30 minutes of the event.
              Keep solving worlds until then!
            </p>
            <Link href="/dashboard" className="btn-primary inline-block">
              ← Back to Dashboard
            </Link>
          </div>
        )}

        {/* Already Submitted */}
        {alreadySubmitted && submission && (
          <div className="animate-fade-in-up">
            <div className="card mb-6 p-6 text-center" style={{ borderColor: "var(--success)" }}>
              <div className="mb-4 text-5xl">🏆</div>
              <h3 className="mb-2 text-2xl font-bold" style={{ color: "var(--success)" }}>
                Answer Submitted!
              </h3>
              <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
                Your final answer has been recorded. No changes can be made.
              </p>
            </div>

            <div className="card p-6">
              <h4 className="mb-4 font-semibold" style={{ color: "var(--text-secondary)" }}>
                Your Submission
              </h4>
              <div className="space-y-4">
                <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                  <p className="mb-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    Real World
                  </p>
                  <p className="text-lg font-semibold">{submission.realWorld}</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                  <p className="mb-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    Villain
                  </p>
                  <p className="text-lg font-semibold">{submission.villain}</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                  <p className="mb-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    Weapon
                  </p>
                  <p className="text-lg font-semibold">{submission.weapon}</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                  <p className="mb-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    Submitted At
                  </p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    {new Date(submission.submittedAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/dashboard" className="btn-primary inline-block">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Open - Submit Form */}
        {isOpen && !alreadySubmitted && (
          <div className="animate-fade-in-up">
            {/* Warning banner */}
            <div
              className="mb-6 rounded-xl p-4 text-center"
              style={{
                background: "rgba(255, 193, 7, 0.1)",
                border: "1px solid var(--warning)",
              }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--warning)" }}>
                ⚠️ You can only submit ONCE. Make sure your answers are correct!
              </p>
            </div>

            <form onSubmit={handleSubmitClick}>
              <div className="space-y-4">
                {/* Real World */}
                <div className="card p-5">
                  <label
                    htmlFor="realWorld"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="text-lg">🌍</span> Real World
                  </label>
                  <input
                    id="realWorld"
                    type="text"
                    value={realWorld}
                    onChange={(e) => setRealWorld(e.target.value)}
                    placeholder="Which world is the real one?"
                    className="input-field"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Villain */}
                <div className="card p-5">
                  <label
                    htmlFor="villain"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="text-lg">🦹</span> Villain
                  </label>
                  <input
                    id="villain"
                    type="text"
                    value={villain}
                    onChange={(e) => setVillain(e.target.value)}
                    placeholder="Who is the villain?"
                    className="input-field"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Weapon */}
                <div className="card p-5">
                  <label
                    htmlFor="weapon"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="text-lg">🗡️</span> Weapon
                  </label>
                  <input
                    id="weapon"
                    type="text"
                    value={weapon}
                    onChange={(e) => setWeapon(e.target.value)}
                    placeholder="What weapon was used?"
                    className="input-field"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {error && (
                <div
                  className="mt-4 rounded-xl px-4 py-3 text-center text-sm"
                  style={{
                    background: "rgba(255, 82, 82, 0.1)",
                    border: "1px solid var(--danger)",
                    color: "var(--danger)",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary mt-6 w-full py-4 text-lg"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Final Answer 🔐"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
            <div
              className="animate-fade-in-up w-full max-w-md rounded-2xl p-8"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
            >
              <div className="mb-4 text-center text-4xl">⚠️</div>
              <h3 className="mb-2 text-center text-xl font-bold">Are you sure?</h3>
              <p className="mb-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                This action cannot be undone. Your final answer will be locked permanently.
              </p>

              <div className="mb-6 space-y-3 rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>Real World:</span>
                  <span className="font-semibold">{realWorld}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>Villain:</span>
                  <span className="font-semibold">{villain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>Weapon:</span>
                  <span className="font-semibold">{weapon}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 rounded-xl border py-3 font-medium transition-colors hover:bg-white/5"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmit}
                  className="btn-primary flex-1 py-3"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
