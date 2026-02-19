"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NotificationToast from "@/components/NotificationToast";
import SessionGuard from "@/components/SessionGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Lock, Unlock, Menu, LogOut, Megaphone, Trophy } from "lucide-react";

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

  if (loading) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent border-primary" />
          <p className="text-muted-foreground">Loading your mystery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen pb-24">
      <NotificationToast />
      <SessionGuard />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">SherlockIT 2.0</h2>
            <p className="text-xs text-muted-foreground">
              Team: <span className="text-primary font-medium">{teamName}</span>
            </p>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {menuOpen && (
              <Card className="absolute right-0 top-12 w-56 z-50 animate-in fade-in zoom-in-95 duration-200">
                <CardContent className="p-2 grid gap-1">
                  <Link href="/announcements" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Megaphone className="h-4 w-4" /> Announcements
                    </Button>
                  </Link>
                  <Link href="/final" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                       <Trophy className="h-4 w-4" /> Final Answer
                    </Button>
                  </Link>
                  <div className="h-px bg-border my-1" />
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-6 pt-8 space-y-8">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Progress
            </h3>
            <span className="text-sm font-bold text-primary">
              {completedCount}/{worlds.length} worlds
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {error && (
            <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="p-4 text-center text-destructive">
                    {error}
                </CardContent>
            </Card>
        )}

        {/* World Grid */}
        <div className="grid gap-4">
          {worlds.map((world, index) => (
            <div
              key={world._id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
            >
              {world.isLocked ? (
                <Card className="opacity-60 bg-muted/50 border-dashed">
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                             <Lock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-muted-foreground">{world.title}</h3>
                            <p className="text-sm text-muted-foreground">Locked — Complete previous worlds</p>
                        </div>
                    </CardContent>
                </Card>
              ) : (
                <Link href={`/world/${world._id}`}>
                  <Card className={`transition-all hover:scale-[1.02] hover:shadow-lg hover:border-primary/50 cursor-pointer ${world.isCompleted ? 'border-success/50 bg-success/5' : 'border-primary/20'}`}>
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${world.isCompleted ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
                             {world.isCompleted ? <CheckCircle className="h-6 w-6" /> : <Unlock className="h-6 w-6" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">{world.title}</h3>
                                {world.isCompleted && <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Completed</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {world.isCompleted ? "Great job!" : "Tap to explore & solve →"}
                            </p>
                        </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          ))}
        </div>

        {worlds.length === 0 && !error && (
          <div className="py-16 text-center space-y-4">
            <div className="text-5xl">🌍</div>
            <div>
                <h3 className="text-xl font-semibold">No Worlds Available</h3>
                <p className="text-muted-foreground">
                Worlds will appear here once the event organizer sets them up.
                </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
