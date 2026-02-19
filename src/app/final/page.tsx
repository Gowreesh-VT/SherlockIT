"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle, AlertTriangle, ArrowLeft, Loader2, Trophy, Lock } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking final answer status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-2xl items-center gap-4 px-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-bold">Final Answer</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {alreadySubmitted ? (
                 <span className="text-success flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Submitted</span>
              ) : isOpen ? (
                 <span className="text-primary flex items-center gap-1"><Clock className="h-3 w-3" /> Time Remaining</span>
              ) : (
                 <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Locked</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-6 pt-8 space-y-6">
        {/* Not Open */}
        {!isOpen && !alreadySubmitted && (
          <Card className="text-center py-12">
            <CardContent>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Clock className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-2xl font-bold">Not Available Yet</h3>
                <p className="mb-6 text-muted-foreground">
                The final answer submission will open during the last 30 minutes of the event.
                Keep solving worlds until then!
                </p>
                <Link href="/dashboard">
                <Button>Back to Dashboard</Button>
                </Link>
            </CardContent>
          </Card>
        )}

        {/* Already Submitted */}
        {alreadySubmitted && submission && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-success/50 bg-success/5">
                <CardContent className="flex flex-col items-center text-center py-8">
                    <div className="h-16 w-16 mb-4 rounded-full bg-success/10 flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="text-2xl font-bold text-success mb-2">Answer Submitted!</h3>
                    <p className="text-muted-foreground">
                        Your final answer has been recorded. Good luck!
                    </p>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Submission</CardTitle>
                <CardDescription>
                    Submitted on {new Date(submission.submittedAt).toLocaleString("en-IN")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-1">
                  <Label className="text-muted-foreground">Real World</Label>
                  <div className="p-3 bg-muted rounded-md font-medium">{submission.realWorld}</div>
                </div>
                <div className="grid gap-1">
                    <Label className="text-muted-foreground">Villain</Label>
                    <div className="p-3 bg-muted rounded-md font-medium">{submission.villain}</div>
                </div>
                <div className="grid gap-1">
                    <Label className="text-muted-foreground">Weapon</Label>
                    <div className="p-3 bg-muted rounded-md font-medium">{submission.weapon}</div>
                </div>
              </CardContent>
              <CardFooter className="justify-center">
                <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Open - Submit Form */}
        {isOpen && !alreadySubmitted && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Alert className="mb-6 border-warning/50 bg-warning/5 text-warning-foreground">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertTitle className="text-warning">Warning</AlertTitle>
                <AlertDescription className="text-warning/90">
                    You can only submit ONCE. This action cannot be undone.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>Submit Final Answer</CardTitle>
                    <CardDescription>Enter your deduction details below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmitClick} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="realWorld">Real World</Label>
                            <Input
                                id="realWorld"
                                value={realWorld}
                                onChange={(e) => setRealWorld(e.target.value)}
                                placeholder="Which world is the real one?"
                                disabled={submitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="villain">Villain</Label>
                            <Input
                                id="villain"
                                value={villain}
                                onChange={(e) => setVillain(e.target.value)}
                                placeholder="Who is the villain?"
                                disabled={submitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weapon">Weapon</Label>
                            <Input
                                id="weapon"
                                value={weapon}
                                onChange={(e) => setWeapon(e.target.value)}
                                placeholder="What weapon was used?"
                                disabled={submitting}
                            />
                        </div>
                        <Button type="submit" className="w-full mt-4" disabled={submitting}>
                            Review & Submit
                        </Button>
                    </form>
                </CardContent>
            </Card>
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Submission</DialogTitle>
                    <DialogDescription>
                        Are you sure these are your final answers? This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-muted-foreground">World</Label>
                        <span className="col-span-3 font-semibold">{realWorld}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-muted-foreground">Villain</Label>
                        <span className="col-span-3 font-semibold">{villain}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-muted-foreground">Weapon</Label>
                        <span className="col-span-3 font-semibold">{weapon}</span>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
                    <Button onClick={confirmSubmit} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm & Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
