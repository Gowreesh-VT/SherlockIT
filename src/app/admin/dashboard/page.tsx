"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Megaphone, Lock, Unlock, LogOut, RefreshCcw, Shield } from "lucide-react";

interface TeamInfo {
  _id: string;
  teamName: string;
  leaderEmail: string;
  memberCount: number;
  completedWorlds: number;
  totalWorlds: number;
  finalSubmitted: boolean;
}

interface Template {
  id: string;
  label: string;
  message: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [finalAnswerOpen, setFinalAnswerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [togglingFinal, setTogglingFinal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [teamsRes, templatesRes, controlRes] = await Promise.all([
        fetch("/api/admin/teams"),
        fetch("/api/admin/announcement"),
        fetch("/api/admin/event-control"),
      ]);

      if (teamsRes.status === 401 || templatesRes.status === 401 || controlRes.status === 401) {
        router.push("/admin");
        return;
      }

      const [teamsData, templatesData, controlData] = await Promise.all([
        teamsRes.json(),
        templatesRes.json(),
        controlRes.json(),
      ]);

      if (teamsData.teams) setTeams(teamsData.teams);
      if (templatesData.templates) setTemplates(templatesData.templates);
      if (controlData.finalAnswerOpen !== undefined) setFinalAnswerOpen(controlData.finalAnswerOpen);
    } catch {
      toast.error("Failed to load admin data");
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function sendNotification(templateId: string) {
    setSendingId(templateId);
    try {
      const res = await fetch("/api/admin/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      if (res.ok) {
        toast.success("📢 Notification sent!");
      } else {
        toast.error("❌ Failed to send notification");
      }
    } catch {
      toast.error("❌ Network error");
    } finally {
      setSendingId(null);
    }
  }

  async function toggleFinalAnswer() {
    setTogglingFinal(true);
    try {
      const res = await fetch("/api/admin/event-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalAnswerOpen: !finalAnswerOpen }),
      });

      if (res.ok) {
        const data = await res.json();
        setFinalAnswerOpen(data.finalAnswerOpen);
        toast.success(data.finalAnswerOpen ? "🚨 Final answer OPENED!" : "🔒 Final answer CLOSED!");
      }
    } catch {
      toast.error("❌ Failed to toggle");
    } finally {
      setTogglingFinal(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent border-primary" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-bold">Admin Dashboard</h2>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-destructive border-destructive/50 hover:bg-destructive/10">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-6 pt-8 space-y-8">
        {/* Event Control */}
        <Card className={finalAnswerOpen ? "border-success/50 bg-success/5" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                     <CardTitle className="text-xl">Event Control</CardTitle>
                     <CardDescription>Manage global game state</CardDescription>
                </div>
                <Button
                    onClick={toggleFinalAnswer}
                    disabled={togglingFinal}
                    variant={finalAnswerOpen ? "destructive" : "default"}
                    className={finalAnswerOpen ? "" : "bg-success hover:bg-success/90"}
                >
                     {togglingFinal ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : finalAnswerOpen ? <Lock className="mr-2 h-4 w-4" /> : <Unlock className="mr-2 h-4 w-4" />}
                     {finalAnswerOpen ? "Close Final Submission" : "Open Final Submission"}
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2">
                     <Badge variant={finalAnswerOpen ? "default" : "secondary"} className={finalAnswerOpen ? "bg-success hover:bg-success/80" : ""}>
                         {finalAnswerOpen ? "OPEN" : "CLOSED"}
                     </Badge>
                     <span className="text-sm text-muted-foreground">
                         {finalAnswerOpen ? "Teams can currently submit their final mystery solution." : "Final submission is currently locked."}
                     </span>
                </div>
            </CardContent>
        </Card>

        {/* Notifications */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" /> Send Notification
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {templates.map((t) => (
              <Button
                key={t.id}
                variant="outline"
                className="h-auto flex-col gap-1 py-4 hover:border-primary hover:bg-primary/5"
                onClick={() => sendNotification(t.id)}
                disabled={sendingId === t.id}
              >
                 {sendingId === t.id ? (
                     <RefreshCcw className="h-6 w-6 animate-spin mb-1 opacity-50" />
                 ) : (
                    <span className="text-2xl mb-1">{t.label.split(" ")[0]}</span>
                 )}
                 <span className="font-semibold">{t.label.split(" ").slice(1).join(" ")}</span>
                 <span className="text-[10px] text-muted-foreground truncate w-full px-2" title={t.message}>{t.message}</span>
              </Button>
            ))}
          </div>
        </section>

        {/* Team Progress */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Team Progress</h3>
            <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
               <RefreshCcw className="h-3 w-3" /> Refresh
            </Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Leader</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead className="w-[200px]">Progress</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {teams.map((team) => (
                        <TableRow key={team._id}>
                            <TableCell className="font-medium">
                                {team.teamName}
                                {team.finalSubmitted && <Badge variant="secondary" className="ml-2 bg-success/10 text-success hover:bg-success/20">Submitted</Badge>}
                            </TableCell>
                            <TableCell>{team.leaderEmail}</TableCell>
                            <TableCell>{team.memberCount}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                     <Progress value={team.totalWorlds > 0 ? (team.completedWorlds / team.totalWorlds) * 100 : 0} className="h-2 w-24" />
                                     <span className="text-xs text-muted-foreground">{team.completedWorlds}/{team.totalWorlds}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                {team.finalSubmitted ? (
                                    <Badge className="bg-success hover:bg-success/90">Completed</Badge>
                                ) : (
                                    <Badge variant="outline">In Progress</Badge>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                    {teams.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                No teams registered yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </div>
  );
}
