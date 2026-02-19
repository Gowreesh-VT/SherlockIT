"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Scroll, HelpCircle, CheckCircle, ArrowLeft, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

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
  const [displayedStory, setDisplayedStory] = useState("");
  const [storyComplete, setStoryComplete] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Typewriter effect
  useEffect(() => {
    if (!world?.story) return;

    // Clear any existing timer
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (world.isCompleted) {
      setDisplayedStory(world.story);
      setStoryComplete(true);
      return;
    }

    let i = 0;
    setDisplayedStory("");
    setStoryComplete(false);

    intervalRef.current = setInterval(() => {
      if (i < world.story.length) {
        setDisplayedStory(world.story.slice(0, i + 1));
        i++;
      } else {
        setStoryComplete(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 25);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [world]);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || submitting) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/worlds/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worldId: id, answer: answer.trim() }),
      });

      const data = await res.json();

      if (data.correct) {
        toast.success(data.message + (data.nextWorldUnlocked ? ` 🌟 New world unlocked: ${data.nextWorldTitle}` : ""));
        setWorld((prev) => prev ? { ...prev, isCompleted: true } : prev);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
      setAnswer("");
    }
  }

  function skipAnimation() {
    if (world) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayedStory(world.story);
      setStoryComplete(true);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Entering the world...</p>
        </div>
      </div>
    );
  }

  if (!world) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <XCircle className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold">World Not Found</h2>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
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
          <div className="flex-1">
            <h2 className="text-lg font-bold truncate">{world.title}</h2>
            <p className="text-xs text-muted-foreground">
              World {world.order} • {world.attempts} attempt{world.attempts !== 1 ? "s" : ""}
            </p>
          </div>
          {world.isCompleted && (
            <Badge variant="outline" className="border-success/50 text-success bg-success/10 gap-1">
              <CheckCircle className="h-3 w-3" /> Completed
            </Badge>
          )}
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-6 pt-8 space-y-6">
        {/* Story Section */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Scroll className="h-5 w-5 text-primary" />
            <span className="font-semibold text-muted-foreground">The Story</span>
          </CardHeader>
          <CardContent className="min-h-[100px] relative">
             <p className="whitespace-pre-wrap leading-relaxed">
                {displayedStory}
                {!storyComplete && (
                    <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle" />
                )}
             </p>
             {!storyComplete && (
               <Button 
                variant="link" 
                size="sm" 
                onClick={skipAnimation}
                className="absolute bottom-2 right-2 text-xs text-muted-foreground hover:text-primary"
               >
                 Skip animation
               </Button>
             )}
          </CardContent>
        </Card>

        {/* Question Section */}
        <Card className="border-secondary/30 bg-secondary/5">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <HelpCircle className="h-5 w-5 text-secondary-foreground" />
            <span className="font-semibold text-secondary-foreground">The Question</span>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{world.question}</p>
          </CardContent>
        </Card>

        {/* Answer Form */}
        {!world.isCompleted ? (
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="answer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Your Answer
                            </label>
                            <Input
                                id="answer"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Type your answer here..."
                                className="h-12 text-lg bg-background"
                                required
                                disabled={submitting}
                                autoComplete="off"
                            />
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full text-lg h-12" 
                            disabled={submitting || !answer.trim()}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...
                                </>
                            ) : (
                                "Submit Answer"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        ) : (
             <Card className="bg-success/5 border-success/30">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-16 w-16 flex items-center justify-center rounded-full bg-success/10 mb-4">
                        <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="text-2xl font-bold text-success mb-2">World Completed!</h3>
                    <p className="text-muted-foreground mb-6">
                        Great detective work! You've solved this mystery.
                    </p>
                    <Link href="/dashboard">
                        <Button variant="outline" className="border-success/50 text-success hover:bg-success/10 hover:text-success">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )}
      </main>
    </div>
  );
}
