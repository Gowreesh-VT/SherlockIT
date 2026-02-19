"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NotificationToast from "@/components/NotificationToast";
import SessionGuard from "@/components/SessionGuard";

interface WorldItem {
  _id: string;
  title: string;
  order: number;
  isLocked: boolean;
  isCompleted: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [worlds, setWorlds] = useState<WorldItem[]>([]);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && !session?.user?.teamId) {
      router.push("/join-team");
      return;
    }

    if (status === "authenticated") {
      fetchWorlds();
    }
  }, [status, session, router]);

  async function fetchWorlds() {
    try {
      const res = await fetch("/api/worlds");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load worlds");
        setLoading(false);
        return;
      }

      setWorlds(data.worlds);
      setTeamName(data.teamName);
      setLoading(false);
    } catch {
      setError("Network error. Please refresh.");
      setLoading(false);
    }
  }

  function getWorldIcon(world: WorldItem) {
    if (world.isCompleted) return "✅";
    if (world.isLocked) return "🔒";
    return "🔓";
  }

  function getWorldStyle(world: WorldItem) {
    if (world.isCompleted) {
      return {
        borderColor: "var(--success)",
        background: "linear-gradient(135deg, rgba(0, 200, 83, 0.08), var(--bg-card))",
      };
    }
    if (world.isLocked) {
      return {
        borderColor: "var(--border-color)",
        opacity: 0.5,
      };
    }
    return {
      borderColor: "var(--accent-primary)",
      background: "linear-gradient(135deg, rgba(233, 69, 96, 0.08), var(--bg-card))",
    };
  }

  const completedCount = worlds.filter((w) => w.isCompleted).length;

  if (loading) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading your mystery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen pb-24">
      {/* Real-time notification popups */}
      <NotificationToast />
      {/* Single device guard — kicks user if another device logs in */}
      <SessionGuard />
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h2 className="text-lg font-bold gradient-text">SherlockIT 2.0</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Team: {teamName}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
            >
              <span className="text-xl">☰</span>
            </button>

            {menuOpen && (
              <div
                className="glass absolute right-0 top-12 w-52 rounded-xl p-2"
                style={{ zIndex: 100 }}
              >
                <Link
                  href="/announcements"
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors hover:bg-white/5"
                  onClick={() => setMenuOpen(false)}
                >
                  📢 Announcements
                </Link>
                <Link
                  href="/final"
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors hover:bg-white/5"
                  onClick={() => setMenuOpen(false)}
                >
                  🏆 Final Answer
                </Link>
                <hr className="my-1" style={{ borderColor: "var(--border-color)" }} />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors hover:bg-white/5"
                  style={{ color: "var(--danger)" }}
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-6 pt-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Progress
            </h3>
            <span className="text-sm font-bold" style={{ color: "var(--accent-primary)" }}>
              {completedCount}/{worlds.length} worlds
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full"
            style={{ background: "var(--bg-secondary)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${worlds.length > 0 ? (completedCount / worlds.length) * 100 : 0}%`,
                background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
              }}
            />
          </div>
        </div>

        {error && (
          <div
            className="mb-6 rounded-xl px-4 py-3 text-center text-sm"
            style={{
              background: "rgba(255, 82, 82, 0.1)",
              border: "1px solid var(--danger)",
              color: "var(--danger)",
            }}
          >
            {error}
          </div>
        )}

        {/* World Grid */}
        <div className="grid gap-4">
          {worlds.map((world, index) => (
            <div
              key={world._id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.08}s`, animationFillMode: "backwards" }}
            >
              {world.isLocked ? (
                <div
                  className="card relative flex items-center gap-4 p-5"
                  style={getWorldStyle(world)}
                >
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl"
                    style={{ background: "var(--bg-secondary)" }}
                  >
                    {getWorldIcon(world)}
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: "var(--text-muted)" }}>
                      {world.title}
                    </h3>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Locked — Complete previous worlds to unlock
                    </p>
                  </div>
                </div>
              ) : (
                <Link href={`/world/${world._id}`}>
                  <div
                    className="card relative flex cursor-pointer items-center gap-4 p-5"
                    style={getWorldStyle(world)}
                  >
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl"
                      style={{
                        background: world.isCompleted
                          ? "rgba(0, 200, 83, 0.15)"
                          : "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                      }}
                    >
                      {getWorldIcon(world)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{world.title}</h3>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {world.isCompleted ? "Completed ✓" : "Tap to explore →"}
                      </p>
                    </div>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>

        {worlds.length === 0 && !error && (
          <div className="py-16 text-center">
            <div className="mb-4 text-5xl">🌍</div>
            <h3 className="mb-2 text-xl font-semibold">No Worlds Available</h3>
            <p style={{ color: "var(--text-secondary)" }}>
              Worlds will appear here once the event organizer sets them up.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
