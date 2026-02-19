"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Trophy,
  Lock,
  Globe,
  User,
  Gavel,
  Send,
  Shield,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";

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
      toast.error("All fields are required.");
      return;
    }
    setShowConfirm(true);
  }

  async function confirmSubmit() {
    setSubmitting(true);
    setShowConfirm(false);

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
        toast.error(data.error || "Submission failed");
        setSubmitting(false);
        return;
      }

      setAlreadySubmitted(true);
      setSubmission(data.submission);
      setSubmitting(false);
      toast.success("Final answer submitted successfully!");
    } catch {
      toast.error("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#000000", fontFamily: "var(--font-rajdhani), sans-serif" }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin" style={{ color: "#d946ef" }} />
          <p className="text-gray-400">Establishing secure connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="text-white min-h-screen relative overflow-x-hidden"
      style={{
        backgroundColor: "#000000",
        fontFamily: "var(--font-rajdhani), sans-serif",
      }}
    >
      {/* Background Effects */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(217, 70, 239, 0.15) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
        }}
      />
      <div
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(6, 182, 212, 0.03) 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(6, 182, 212, 0.03) 50px)",
        }}
      />

      {/* Scanline */}
      <div className="scanline-overlay" />

      <main className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col px-5 py-8">
        {/* Back Arrow */}
        <div className="mb-6">
          <Link href="/dashboard">
            <button className="p-2 rounded-full glass-panel hover:bg-white/10 transition-colors group cursor-pointer">
              <ArrowLeft className="w-5 h-5 group-hover:text-white transition-colors" style={{ color: "#06b6d4" }} />
            </button>
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Wifi className="w-3 h-3 animate-pulse" style={{ color: "#10b981" }} />
            <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-mono">
              Secure Connection Established
            </span>
          </div>
          <h1
            className="text-3xl font-black tracking-widest mb-1 glitch-text"
            data-text="SHERLOCK IT"
            style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
          >
            SHERLOCK IT
          </h1>
          <div
            className="text-xs uppercase tracking-[0.2em] font-bold mb-4"
            style={{ color: "#d946ef" }}
          >
            Multiverse Edition
          </div>
        </div>

        {/* Not Open State */}
        {!isOpen && !alreadySubmitted && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-12">
            <div
              className="p-6 rounded-full"
              style={{
                backgroundColor: "rgba(217, 70, 239, 0.1)",
                border: "1px solid rgba(217, 70, 239, 0.3)",
                boxShadow: "0 0 30px rgba(217, 70, 239, 0.2)",
              }}
            >
              <Clock className="w-12 h-12" style={{ color: "#d946ef" }} />
            </div>
            <div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
              >
                NOT AVAILABLE YET
              </h3>
              <p className="text-gray-400 max-w-xs">
                The final answer submission will open during the last 30 minutes of the event.
                Keep solving worlds until then!
              </p>
            </div>
            <Link href="/dashboard">
              <button
                className="px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition-all cursor-pointer"
                style={{
                  backgroundColor: "rgba(6, 182, 212, 0.1)",
                  border: "1px solid #06b6d4",
                  color: "#06b6d4",
                  fontFamily: "var(--font-orbitron), sans-serif",
                }}
              >
                Back to Dashboard
              </button>
            </Link>
          </div>
        )}

        {/* Already Submitted */}
        {alreadySubmitted && submission && (
          <div className="flex-1 flex flex-col gap-6 py-4">
            {/* Success Card */}
            <div
              className="glass-panel rounded-2xl p-8 text-center"
              style={{ border: "1px solid rgba(16, 185, 129, 0.3)" }}
            >
              <div className="relative inline-block mb-4">
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-30"
                  style={{ backgroundColor: "#10b981" }}
                />
                <div
                  className="relative h-16 w-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}
                >
                  <Trophy className="h-8 w-8 text-emerald-500" />
                </div>
              </div>
              <h3
                className="text-2xl font-bold text-emerald-400 mb-2"
                style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
              >
                ANSWER SUBMITTED!
              </h3>
              <p className="text-gray-400">
                Your final answer has been recorded. Good luck, detective!
              </p>
            </div>

            {/* Submission Details */}
            <div
              className="glass-panel rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}
            >
              <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                <h4
                  className="text-sm uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-orbitron), sans-serif", color: "#06b6d4" }}
                >
                  Your Submission
                </h4>
                <p className="text-[11px] text-gray-500 font-mono">
                  Submitted on {new Date(submission.submittedAt).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { label: "REAL WORLD", value: submission.realWorld, icon: Globe, color: "#06b6d4" },
                  { label: "THE CULPRIT", value: submission.villain, icon: User, color: "#d946ef" },
                  { label: "THE WEAPON", value: submission.weapon, icon: Gavel, color: "#fbbf24" },
                ].map((field) => (
                  <div key={field.label} className="flex items-start gap-3">
                    <field.icon className="w-5 h-5 mt-0.5" style={{ color: field.color }} />
                    <div>
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block">{field.label}</span>
                      <span className="text-white font-semibold text-lg">{field.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/dashboard" className="mt-2">
              <button
                className="w-full py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition-all cursor-pointer"
                style={{
                  backgroundColor: "rgba(6, 182, 212, 0.1)",
                  border: "1px solid #06b6d4",
                  color: "#06b6d4",
                  fontFamily: "var(--font-orbitron), sans-serif",
                }}
              >
                ← Back to Dashboard
              </button>
            </Link>
          </div>
        )}

        {/* Open - Submit Form */}
        {isOpen && !alreadySubmitted && (
          <div className="flex-1 flex flex-col gap-6 py-4">
            {/* Warning Banner */}
            <div
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-full mx-auto"
              style={{
                backgroundColor: "rgba(251, 191, 36, 0.1)",
                border: "1px solid rgba(251, 191, 36, 0.3)",
              }}
            >
              <AlertTriangle className="w-4 h-4" style={{ color: "#fbbf24" }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#fbbf24" }}>
                Only one submission allowed
              </span>
            </div>

            <form onSubmit={handleSubmitClick} className="space-y-5 flex-1 flex flex-col">
              {/* Real World Field */}
              <div
                className="rounded-xl p-[1px] overflow-hidden"
                style={{ background: "linear-gradient(135deg, #06b6d4, rgba(6, 182, 212, 0.2))" }}
              >
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5" style={{ color: "#06b6d4" }} />
                      <span
                        className="text-sm font-bold uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
                      >
                        Real World
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">ID: EARTH-616</span>
                  </div>
                  <input
                    className="w-full bg-transparent text-gray-300 placeholder-gray-600 focus:outline-none py-2 text-lg tracking-wide border-b border-gray-800 focus:border-cyan-500 transition-colors"
                    style={{ fontFamily: "var(--font-rajdhani), sans-serif" }}
                    placeholder="Select Origin Reality..."
                    value={realWorld}
                    onChange={(e) => setRealWorld(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Culprit Field */}
              <div
                className="rounded-xl p-[1px] overflow-hidden"
                style={{ background: "linear-gradient(135deg, #d946ef, rgba(217, 70, 239, 0.2))" }}
              >
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5" style={{ color: "#d946ef" }} />
                      <span
                        className="text-sm font-bold uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
                      >
                        The Culprit
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">SUSPECT #??</span>
                  </div>
                  <input
                    className="w-full bg-transparent text-gray-300 placeholder-gray-600 focus:outline-none py-2 text-lg tracking-wide border-b border-gray-800 focus:border-fuchsia-500 transition-colors"
                    style={{ fontFamily: "var(--font-rajdhani), sans-serif" }}
                    placeholder="Enter Villain Name"
                    value={villain}
                    onChange={(e) => setVillain(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Weapon Field */}
              <div
                className="rounded-xl p-[1px] overflow-hidden"
                style={{ background: "linear-gradient(135deg, #fbbf24, rgba(251, 191, 36, 0.2))" }}
              >
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Gavel className="w-5 h-5" style={{ color: "#fbbf24" }} />
                      <span
                        className="text-sm font-bold uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
                      >
                        The Weapon
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">CLASS: LETHAL</span>
                  </div>
                  <input
                    className="w-full bg-transparent text-gray-300 placeholder-gray-600 focus:outline-none py-2 text-lg tracking-wide border-b border-gray-800 focus:border-amber-500 transition-colors"
                    style={{ fontFamily: "var(--font-rajdhani), sans-serif" }}
                    placeholder="Identify the Weapon"
                    value={weapon}
                    onChange={(e) => setWeapon(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-auto pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full relative overflow-hidden group rounded-xl p-[2px] focus:outline-none cursor-pointer"
                >
                  <span
                    className="absolute inset-0 w-full h-full"
                    style={{ background: "linear-gradient(to right, #d946ef, #06b6d4)" }}
                  />
                  <span className="relative block w-full bg-black/80 group-hover:bg-transparent transition-colors duration-300 rounded-[10px] py-4">
                    <span
                      className="relative flex items-center justify-center font-black tracking-widest uppercase text-white text-lg"
                      style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Final Submit
                          <Send className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </span>
                </button>
                <p className="text-center text-[10px] text-amber-500/70 mt-3 font-mono">
                  * IRREVERSIBLE ACTION. PROCEED WITH CAUTION.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center space-y-1">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono">
            VIT Chennai // Microsoft Innovations Club
          </p>
          <p className="text-[9px] text-gray-700 uppercase tracking-widest font-mono flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            Encrypted Channel: AES-256
          </p>
        </footer>
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-5"
            style={{
              backgroundColor: "rgba(10, 10, 15, 0.95)",
              border: "1px solid rgba(6, 182, 212, 0.3)",
              boxShadow: "0 0 40px rgba(6, 182, 212, 0.15), 0 0 80px rgba(217, 70, 239, 0.1)",
            }}
          >
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: "rgba(217, 70, 239, 0.1)" }}
              >
                <Lock className="w-7 h-7" style={{ color: "#d946ef" }} />
              </div>
              <h3
                className="text-lg font-bold tracking-wider mb-1"
                style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
              >
                CONFIRM SUBMISSION
              </h3>
              <p className="text-xs text-gray-400">
                This action cannot be undone. Are you sure?
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: "World", value: realWorld, color: "#06b6d4" },
                { label: "Villain", value: villain, color: "#d946ef" },
                { label: "Weapon", value: weapon, color: "#fbbf24" },
              ].map((field) => (
                <div
                  key={field.label}
                  className="flex justify-between items-center py-2 px-3 rounded-lg"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                >
                  <span className="text-xs text-gray-400 font-mono uppercase">{field.label}</span>
                  <span className="font-semibold" style={{ color: field.color }}>
                    {field.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors cursor-pointer"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "white",
                  fontFamily: "var(--font-orbitron), sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors cursor-pointer"
                style={{
                  background: "linear-gradient(to right, #d946ef, #06b6d4)",
                  color: "white",
                  fontFamily: "var(--font-orbitron), sans-serif",
                }}
              >
                {submitting ? "..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
