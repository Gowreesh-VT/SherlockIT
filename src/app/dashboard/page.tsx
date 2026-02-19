"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NotificationToast from "@/components/NotificationToast";
import SessionGuard from "@/components/SessionGuard";
import {
  CheckCircle,
  Lock,
  Bell,
  Menu,
  LogOut,
  Megaphone,
  LayoutDashboard,
  User,
  ArrowRight,
  Wifi,
  X,
  Shield,
  Send,
} from "lucide-react";

interface WorldItem {
  _id: string;
  title: string;
  order: number;
  isLocked: boolean;
  isCompleted: boolean;
  description?: string;
  imageUrl?: string;
}

// Placeholder images for worlds
const WORLD_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA7bffefVZVKbRFlknSI2PQr5PdnkO-fGj1m1NYqVmJKbXMV4V96feJiN3YcCsKhc4jl-t1es_vPfDLVRwW84Be-gjB8lkffOXfDnOBPGSGKXK6gT-C2A6bEOAlj07Cc_davCScv8OeDbWqoWafUHJzDmZJpIIy_OvoW-Eea4hTmCQ0FKdzqY9SYjUAWFOJjZnFE4Gy6teJnv63dYHHFFnKBouNu9R0uaN29bJb3iaECKGZAi_Lgxj1Mnh5FOa3CshXZAG493v0fQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCQjiBSAbg51agRmM5soz_ciIB_WxdEifNJTje6_Q3y8aNw8ubE8TX1dih2_EC4svbLbAWHrZ3ckL6E893GD42PmQXDY_zfsEMmlXAN787np5HwYQlraHVcjxCLjFE6NKEnjqWb5G_kuRlECRtcM9GBDf92_oIxbr1oYoon5zvPHDipo7t1hdN7aMLKZcitypfHKk9Fbjd11mOpCyXGXrJJqsfYD0piM_SFVVFTxb4Au8QPtVBDJefom382JdzWY_mW1OV3UIjssw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuChv2h4mfJ-Cp5r6ETZWRiLFNlMloS1JNSHncWbqGteqtgV6AZXZxACY2iXqB3gRcupUjGx3LStapEj_SRF2emcDf6xrH2_bFkwnREvei5ej3_KKxQtsb7drE3z5P2zZaFp5lts01nnXQYYGc8rXJUO06Wu5c0VBfrvreSs-yYEnxEkiEMbvrfKOJ_GJ0qrso3_MveV51Nu7iCfAEjQATuj39lkWagX8skVdmLQsi4e-WXoWBKQQIfmPlYx8WrFTMZdk-XjV_cRMw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCFcSGw8Smzp0KhRP3V6Lmn7tskZw17YhDaNRm11awxugZ3b6pypJc9wQ5efi-Q6xVoSOEADn1RpoSPrHs0T2fFJUEAG6hhj9itqZ3YeAVguNagKr87MG-U0hU8BmEUrUtRjGaDSWOoI6lMfNF-cafhKcaIb1zgaflVccNgpSlJXzdgUckXUlN_Nx1UfVzn0XkIU6xu97wVEhdrOwubNO2E4cc6ux3IpUqmxz5CHUBiCvTN-w7XOcBjMrbpfMH6b85EEUS74sKiAg",
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [worlds, setWorlds] = useState<WorldItem[]>([]);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && !session?.user?.teamId) {
      router.push("/");
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

  const completedCount = worlds.filter((w) => w.isCompleted).length;
  const progressPercent = worlds.length > 0 ? (completedCount / worlds.length) * 100 : 0;

  // Find the first unlocked, incomplete world (current mission)
  const currentWorld = worlds.find((w) => !w.isLocked && !w.isCompleted);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#000000", fontFamily: "var(--font-rajdhani), sans-serif" }}
      >
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="text-slate-400" style={{ fontFamily: "var(--font-orbitron), sans-serif" }}>
            Loading your mystery...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="text-slate-200 min-h-screen relative overflow-x-hidden"
      style={{
        backgroundColor: "#000000",
        fontFamily: "var(--font-rajdhani), sans-serif",
      }}
    >
      <NotificationToast />
      <SessionGuard />

      {/* Cyber Grid Background */}
      <div
        className="fixed inset-0 z-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, rgba(0, 0, 0, 0) 50%), repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(6, 182, 212, 0.05) 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(6, 182, 212, 0.05) 50px)",
        }}
      />

      {/* Scanline */}
      <div className="scanline-overlay" />

      {/* Header */}
      <header
        className="fixed top-0 w-full z-40 backdrop-blur-md px-4 py-3 flex justify-between items-center shadow-lg"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="relative">
          <button
            className="text-white hover:text-cyan-400 transition-colors cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>

          {menuOpen && (
            <div
              className="absolute left-0 top-12 w-56 z-50 rounded-xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-200"
              style={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Link
                href="/announcements"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-colors text-sm"
              >
                <Megaphone className="w-4 h-4" /> Announcements
              </Link>
              <Link
                href="/final"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-colors text-sm"
              >
                <Send className="w-4 h-4" /> Final Answer
              </Link>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-sm w-full cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center">
          <h1
            className="font-bold text-lg tracking-widest text-white glitch-text"
            data-text="SHERLOCK IT"
            style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
          >
            SHERLOCK IT
          </h1>
          <span
            className="text-[10px] uppercase tracking-[0.2em] font-bold"
            style={{ color: "#06b6d4" }}
          >
            Multiverse Edition
          </span>
        </div>

        <Link href="/announcements" className="relative group">
          <Bell className="w-6 h-6 text-white group-hover:text-yellow-400 transition-colors" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
          <span
            className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full shadow-neon-gold"
            style={{ border: "1px solid black" }}
          />
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-24 pb-28 px-4 max-w-lg mx-auto flex flex-col gap-6">
        {/* Team Info Bar */}
        <div
          className="rounded-lg p-3 flex justify-between items-center backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(10, 10, 10, 0.5)",
            border: "1px solid rgba(6, 182, 212, 0.3)",
          }}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: "#06b6d4" }} />
            <span className="text-xs font-bold text-slate-300">
              DETECTIVE <span className="text-white">{teamName.toUpperCase()}</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">
              SCORE:{" "}
              <span className="font-bold text-sm" style={{ color: "#06b6d4" }}>
                {completedCount * 100}
              </span>
            </span>
            <span className="w-px h-3 bg-white/20" />
            <span className="text-slate-400">
              PROGRESS:{" "}
              <span className="font-bold text-sm" style={{ color: "#ffd700" }}>
                {Math.round(progressPercent)}%
              </span>
            </span>
          </div>
        </div>

        {/* WORLDS Header */}
        <div className="flex items-end justify-between border-b border-white/10 pb-2">
          <h2
            className="text-xl text-white tracking-wider"
            style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
          >
            WORLDS
          </h2>
          <span className="text-xs text-slate-400 font-mono mb-1">Select a reality</span>
        </div>

        {error && (
          <div
            className="rounded-lg p-4 text-center"
            style={{
              backgroundColor: "rgba(220, 38, 38, 0.1)",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              color: "#ef4444",
            }}
          >
            {error}
          </div>
        )}

        {/* World Cards */}
        <div className="space-y-6">
          {worlds.map((world, index) => {
            const imgUrl = world.imageUrl || WORLD_IMAGES[index % WORLD_IMAGES.length];
            const isCurrent = currentWorld?._id === world._id;

            if (world.isCompleted) {
              // ✅ COMPLETED WORLD
              return (
                <Link href={`/world/${world._id}`} key={world._id}>
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur-md group-hover:bg-emerald-500/20 transition-all duration-500" />
                    <div
                      className="relative rounded-xl overflow-hidden shadow-neon-green transform transition-transform hover:scale-[1.02]"
                      style={{
                        backgroundColor: "#0a0a0a",
                        border: "1px solid rgba(16, 185, 129, 0.5)",
                      }}
                    >
                      {/* Solved Badge */}
                      <div
                        className="absolute top-3 right-3 z-20 flex items-center gap-1 backdrop-blur px-2 py-1 rounded"
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                        }}
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                          Solved
                        </span>
                      </div>

                      {/* Image */}
                      <div className="h-32 w-full relative">
                        <Image
                          src={imgUrl}
                          alt={world.title}
                          fill
                          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="p-4 relative">
                        <h3
                          className="text-lg text-white mb-1"
                          style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
                        >
                          {world.title}
                        </h3>
                        <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                          {world.description || "Mystery solved. Case file closed."}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span
                            className="text-[10px] px-2 py-1 rounded text-slate-300"
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            World {world.order}
                          </span>
                          <span className="text-xs text-emerald-500 font-mono">100% Complete</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }

            if (!world.isLocked && isCurrent) {
              // 🔵 CURRENT / ACTIVE WORLD
              return (
                <Link href={`/world/${world._id}`} key={world._id}>
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-cyan-500/20 rounded-xl blur-lg animate-pulse" />
                    <div
                      className="relative rounded-xl overflow-hidden shadow-neon-cyan transform transition-transform hover:scale-[1.02]"
                      style={{
                        backgroundColor: "#0a0a0a",
                        border: "2px solid #06b6d4",
                      }}
                    >
                      {/* Glowing top bar */}
                      <div
                        className="absolute top-0 left-0 w-full h-1"
                        style={{
                          backgroundColor: "#06b6d4",
                          boxShadow: "0 0 10px #06b6d4",
                        }}
                      />

                      {/* Live Badge */}
                      <div
                        className="absolute top-3 right-3 z-20 flex items-center gap-1 backdrop-blur px-2 py-1 rounded"
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          border: "1px solid rgba(6, 182, 212, 0.5)",
                        }}
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider ml-1" style={{ color: "#06b6d4" }}>
                          Live
                        </span>
                      </div>

                      {/* Image */}
                      <div className="h-36 w-full relative">
                        <Image
                          src={imgUrl}
                          alt={world.title}
                          fill
                          className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="p-4 relative -mt-6">
                        <div className="flex justify-between items-end mb-2">
                          <h3
                            className="text-xl text-white font-bold tracking-wide"
                            style={{
                              fontFamily: "var(--font-orbitron), sans-serif",
                              filter: "drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))",
                            }}
                          >
                            {world.title}
                          </h3>
                          <span
                            className="text-xs font-mono px-2 py-0.5 rounded"
                            style={{
                              color: "#06b6d4",
                              backgroundColor: "rgba(6, 182, 212, 0.1)",
                              border: "1px solid rgba(6, 182, 212, 0.3)",
                            }}
                          >
                            CURRENT MISSION
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 mb-4">
                          {world.description || "Investigate this reality and solve the mystery within."}
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full bg-white/10 rounded-full h-1.5 mb-2 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: "33%",
                              backgroundColor: "#06b6d4",
                              boxShadow: "0 0 10px #06b6d4",
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono uppercase">
                          <span>Progress</span>
                          <span>In Progress</span>
                        </div>

                        <button
                          className="w-full mt-4 font-bold py-2 rounded uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                          style={{
                            backgroundColor: "rgba(6, 182, 212, 0.1)",
                            border: "1px solid #06b6d4",
                            color: "#06b6d4",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#06b6d4";
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(6, 182, 212, 0.1)";
                            e.currentTarget.style.color = "#06b6d4";
                          }}
                        >
                          <span>Resume Investigation</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }

            if (!world.isLocked) {
              // Unlocked but not current — clickable
              return (
                <Link href={`/world/${world._id}`} key={world._id}>
                  <div className="relative group cursor-pointer">
                    <div
                      className="relative rounded-xl overflow-hidden transform transition-transform hover:scale-[1.02]"
                      style={{
                        backgroundColor: "#0a0a0a",
                        border: "1px solid rgba(6, 182, 212, 0.3)",
                      }}
                    >
                      <div className="h-28 w-full relative">
                        <Image
                          src={imgUrl}
                          alt={world.title}
                          fill
                          className="object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      </div>
                      <div className="p-4">
                        <h3
                          className="text-lg text-white mb-1"
                          style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
                        >
                          {world.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {world.description || "A mystery awaits your investigation."}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }

            // 🔒 LOCKED WORLD
            return (
              <div key={world._id} className="relative select-none">
                <div
                  className="relative rounded-xl overflow-hidden backdrop-blur-sm grayscale opacity-70"
                  style={{
                    backgroundColor: "rgba(10, 10, 10, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  {/* Lock Overlay */}
                  <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
                    <div
                      className="p-3 rounded-full shadow-lg"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Lock className="w-7 h-7 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <span
                        className="text-xs text-slate-300 tracking-widest uppercase block mb-1"
                        style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
                      >
                        Locked Reality
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Complete previous worlds to unlock
                      </span>
                    </div>
                  </div>

                  {/* Background Image */}
                  <div className="h-28 w-full relative">
                    <Image
                      src={imgUrl}
                      alt={world.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3
                      className="text-lg text-slate-500 mb-1"
                      style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
                    >
                      {world.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {world.description || "Unlock by completing previous investigations."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {worlds.length === 0 && !error && (
          <div className="py-16 text-center space-y-4">
            <div className="text-5xl">🌍</div>
            <div>
              <h3 className="text-xl font-semibold text-white">No Worlds Available</h3>
              <p className="text-slate-400">
                Worlds will appear here once the event organizer sets them up.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-5 py-2.5 rounded-full backdrop-blur-xl shadow-2xl"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <button
          className="p-2 rounded-full transition-colors"
          style={{
            color: "#06b6d4",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(6, 182, 212, 0.2)",
            boxShadow: "0 0 15px rgba(6, 182, 212, 0.3)",
          }}
        >
          <LayoutDashboard className="w-5 h-5" />
        </button>
        <Link href="/announcements" className="p-2 text-slate-400 hover:text-white transition-colors">
          <Megaphone className="w-5 h-5" />
        </Link>
        <Link href="/final" className="p-2 text-slate-400 hover:text-white transition-colors">
          <Send className="w-5 h-5" />
        </Link>
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer relative"
        >
          <User className="w-5 h-5" />
        </button>
      </div>

      {/* Team Profile Panel */}
      {showProfile && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={() => setShowProfile(false)}>
          <div
            className="w-full max-w-lg mx-4 mb-24 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
            style={{
              backgroundColor: "rgba(10, 10, 15, 0.95)",
              border: "1px solid rgba(6, 182, 212, 0.3)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 0 40px rgba(6, 182, 212, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Profile Header */}
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.3)" }}
              >
                <Shield className="w-6 h-6" style={{ color: "#06b6d4" }} />
              </div>
              <div>
                <h3
                  className="text-white font-bold text-sm tracking-wider"
                  style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
                >
                  {teamName.toUpperCase()}
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  {session?.user?.email || "detective@sherlockit.com"}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div
                className="rounded-lg p-3 text-center"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)" }}
              >
                <p className="text-lg font-bold" style={{ color: "#06b6d4", fontFamily: "var(--font-orbitron), sans-serif" }}>
                  {completedCount}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Solved</p>
              </div>
              <div
                className="rounded-lg p-3 text-center"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)" }}
              >
                <p className="text-lg font-bold" style={{ color: "#ffd700", fontFamily: "var(--font-orbitron), sans-serif" }}>
                  {completedCount * 100}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Score</p>
              </div>
              <div
                className="rounded-lg p-3 text-center"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)" }}
              >
                <p className="text-lg font-bold" style={{ color: "#10b981", fontFamily: "var(--font-orbitron), sans-serif" }}>
                  {Math.round(progressPercent)}%
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Progress</p>
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-sm font-medium cursor-pointer"
              style={{ border: "1px solid rgba(239, 68, 68, 0.2)" }}
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* JSX Styles */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
