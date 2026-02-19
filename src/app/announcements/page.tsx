"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AnnouncementItem {
  _id: string;
  message: string;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      fetchAnnouncements();

      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchAnnouncements, 30000);
      return () => clearInterval(interval);
    }
  }, [status, router]);

  async function fetchAnnouncements() {
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      if (res.ok) {
        setAnnouncements(data.announcements);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function timeAgo(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  if (loading) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading announcements...</p>
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
            <h2 className="font-bold gradient-text">Announcements</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Auto-refreshes every 30s
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-6 pt-8">
        {announcements.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mb-4 text-5xl">📢</div>
            <h3 className="mb-2 text-xl font-semibold">No Announcements Yet</h3>
            <p style={{ color: "var(--text-secondary)" }}>
              Check back soon for updates from the organizers.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((item, index) => (
              <div
                key={item._id}
                className="card animate-fade-in-up p-5"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "backwards" }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      background: "rgba(233, 69, 96, 0.15)",
                      color: "var(--accent-primary)",
                    }}
                  >
                    📢 Update
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {timeAgo(item.createdAt)}
                  </span>
                </div>
                <p className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  {item.message}
                </p>
                <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  {formatTime(item.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
