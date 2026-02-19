"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Bell,
  Shield,
  Server,
  ExternalLink,
  MapPin,
  Paperclip,
  FileText,
  Home,
  LayoutDashboard,
  Trophy,
  User,
} from "lucide-react";

interface AnnouncementItem {
  _id: string;
  message: string;
  createdAt: string;
}

// Announcement image placeholder
const ANNOUNCEMENT_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCQjiBSAbg51agRmM5soz_ciIB_WxdEifNJTje6_Q3y8aNw8ubE8TX1dih2_EC4svbLbAWHrZ3ckL6E893GD42PmQXDY_zfsEMmlXAN787np5HwYQlraHVcjxCLjFE6NKEnjqWb5G_kuRlECRtcM9GBDf92_oIxbr1oYoon5zvPHDipo7t1hdN7aMLKZcitypfHKk9Fbjd11mOpCyXGXrJJqsfYD0piM_SFVVFTxb4Au8QPtVBDJefom382JdzWY_mW1OV3UIjssw";

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

      // Auto-refresh every 5 seconds for near-real-time updates
      const interval = setInterval(fetchAnnouncements, 5000);
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

  // Assign pseudo-random props to announcements for visual variety
  const getAnnouncementMeta = (index: number) => {
    const types = [
      { label: "ADMIN", color: "#a855f7", textColor: "#a855f7", tag: "UPLINK_SECURE", icon: Shield },
      { label: "SYSTEM", color: "#06b6d4", textColor: "#06b6d4", tag: "SYS_BROADCAST", icon: Server },
      { label: "ADMIN", color: "#d946ef", textColor: "#d946ef", tag: "UPLINK_SECURE", icon: Shield },
    ];
    return types[index % types.length];
  };

  if (loading) {
    return (
      <div
        className="relative z-10 flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#05050A", fontFamily: "var(--font-rajdhani), sans-serif" }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
            style={{ borderColor: "#a855f7", borderTopColor: "transparent" }}
          />
          <p className="text-gray-400">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="text-white min-h-screen relative overflow-x-hidden"
      style={{
        backgroundColor: "#05050A",
        fontFamily: "var(--font-rajdhani), sans-serif",
      }}
    >
      {/* Star Field Background */}
      <div className="fixed inset-0 z-0 stars opacity-30 pointer-events-none" />

      {/* Subtle radial gradient */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 0%, rgba(168, 85, 247, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 100%, rgba(6, 182, 212, 0.05) 0%, transparent 60%)",
        }}
      />

      {/* Header */}
      <header className="fixed top-0 w-full z-40 backdrop-blur-md px-5 py-5" style={{ backgroundColor: "rgba(5, 5, 10, 0.85)", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/dashboard">
            <button className="p-2 rounded-full glass-panel hover:bg-white/10 transition-colors group cursor-pointer">
              <ArrowLeft className="w-5 h-5 group-hover:text-white transition-colors" style={{ color: "#06b6d4" }} />
            </button>
          </Link>
          <Link href="/announcements">
            <button className="p-2 rounded-full glass-panel hover:bg-white/10 transition-colors relative cursor-pointer">
              <Bell className="w-5 h-5 text-white" />
            </button>
          </Link>
        </div>
        <div className="max-w-lg mx-auto mt-4">
          <h1
            className="text-3xl font-black tracking-wider"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              background: "linear-gradient(to right, #a855f7, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ANNOUNCEMENTS
          </h1>
          <p className="text-[11px] text-gray-500 tracking-widest uppercase mt-1" style={{ fontFamily: "var(--font-orbitron), sans-serif" }}>
            SherlockIT // Multiverse Uplink
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 pt-40 pb-28 max-w-lg mx-auto px-5">
        {announcements.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mb-4 text-5xl">📢</div>
            <h3
              className="mb-2 text-xl font-semibold text-white"
              style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
            >
              No Transmissions Yet
            </h3>
            <p className="text-gray-400">
              Check back soon for updates from HQ.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div
              className="absolute left-[11px] top-0 bottom-0 w-px"
              style={{ background: "linear-gradient(to bottom, #a855f7, rgba(168, 85, 247, 0.1))" }}
            />

            <div className="space-y-8">
              {announcements.map((item, index) => {
                const meta = getAnnouncementMeta(index);
                const isLatest = index === 0;

                return (
                  <div key={item._id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div
                      className="absolute left-0 top-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: isLatest ? meta.color : "rgba(255, 255, 255, 0.05)",
                        border: isLatest ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: isLatest ? `0 0 15px ${meta.color}` : "none",
                      }}
                    >
                      <meta.icon className="w-3 h-3" style={{ color: isLatest ? "white" : "gray" }} />
                    </div>

                    {/* Card */}
                    <div
                      className="rounded-xl overflow-hidden transition-all duration-500"
                      style={{
                        backgroundColor: "rgba(15, 15, 20, 0.7)",
                        border: isLatest ? `1px solid ${meta.color}40` : "1px solid rgba(255, 255, 255, 0.05)",
                        boxShadow: isLatest ? `0 0 20px ${meta.color}20` : "none",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      {/* Card Header */}
                      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                            style={{
                              color: meta.textColor,
                              backgroundColor: `${meta.color}15`,
                              border: `1px solid ${meta.color}30`,
                            }}
                          >
                            {meta.tag}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-mono">
                          {formatTime(item.createdAt)}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="px-4 py-4">
                        <p className="text-gray-200 text-[15px] leading-relaxed">
                          {item.message}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[11px] text-gray-500 font-mono">
                            {timeAgo(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Divider Label between cards */}
                    {index < announcements.length - 1 && (
                      <div className="flex items-center gap-2 mt-5 -ml-10 pl-[11px]">
                        <span className="w-3 h-px bg-gray-700" />
                        <span className="text-[9px] text-gray-600 font-mono tracking-widest uppercase">
                          SYS.LOG
                        </span>
                        <span className="flex-1 h-px bg-gray-800" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-4 py-2 rounded-full backdrop-blur-xl shadow-2xl"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Link href="/dashboard" className="p-2 text-slate-400 hover:text-white transition-colors">
          <Home className="w-5 h-5" />
        </Link>
        <Link href="/dashboard" className="p-2 text-slate-400 hover:text-white transition-colors">
          <LayoutDashboard className="w-5 h-5" />
        </Link>
        <Link href="/final" className="p-2 text-slate-400 hover:text-white transition-colors">
          <Trophy className="w-5 h-5" />
        </Link>
        <Link href="/announcements" className="p-2 text-slate-400 hover:text-white transition-colors">
          <User className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
