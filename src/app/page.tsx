"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { LogIn, LogOut, Search, Lock, Info } from "lucide-react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.teamId) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  // Authenticated but no team → Access Denied
  const isAccessDenied = status === "authenticated" && !session?.user?.teamId;

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 overflow-hidden">
      {/* Floating Orbs decoration - Keep custom for vibe */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-float absolute top-20 left-10 h-32 w-32 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent)", animationDelay: "0s" }}
        />
        <div
          className="animate-float absolute top-40 right-20 h-48 w-48 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(var(--secondary)), transparent)", animationDelay: "1s" }}
        />
        <div
          className="animate-float absolute bottom-32 left-1/4 h-24 w-24 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent)", animationDelay: "2s" }}
        />
      </div>

      {/* Main content */}
      <div className="animate-fade-in-up flex flex-col items-center text-center max-w-2xl w-full">
        {/* Logo / Icon */}
        <div
          className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl text-5xl bg-card border border-border shadow-2xl"
          style={{
            boxShadow: isAccessDenied
              ? "0 8px 32px rgba(239, 68, 68, 0.4)" // destructive
              : "0 8px 32px rgba(233, 69, 96, 0.4)", // primary
          }}
        >
          {isAccessDenied ? "🚫" : "🔍"}
        </div>

        {isAccessDenied ? (
          <Card className="w-full border-destructive/50 bg-destructive/10 backdrop-blur-md">
             <CardHeader>
                <CardTitle className="text-destructive flex items-center justify-center gap-2 text-3xl">
                    <Lock className="h-8 w-8" /> Access Denied
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <Alert variant="destructive" className="bg-destructive/20 border-destructive/30 text-destructive-foreground">
                    <AlertTitle>Unregistered Email</AlertTitle>
                    <AlertDescription>
                        Your email <Badge variant="outline" className="ml-1 border-destructive/50 text-destructive-foreground">{session?.user?.email}</Badge> is not registered for this event.
                    </AlertDescription>
                </Alert>
                
                <p className="text-muted-foreground">
                  Only pre-registered team leaders can access SherlockIT 2.0.
                  Please contact your event organizer if you believe this is a mistake.
                </p>

                <Button 
                    variant="outline" 
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full mt-4 border-destructive/50 hover:bg-destructive/20 hover:text-destructive-foreground"
                >
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out & Try Another Account
                </Button>
             </CardContent>
          </Card>
        ) : (
          <>
            {/* Normal Landing State */}
            <h1
              className="mb-4 text-5xl font-black tracking-tight md:text-7xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">Sherlock</span>
              <span className="text-foreground">IT</span>
              <Badge variant="secondary" className="ml-2 text-xl align-top bg-secondary text-secondary-foreground hover:bg-secondary/80">
                2.0
              </Badge>
            </h1>

            <p className="mb-2 text-xl font-medium md:text-2xl text-muted-foreground">
              The Mystery Awaits
            </p>

            <p className="mb-12 max-w-md text-base text-muted-foreground/80">
              Explore hidden worlds, solve cryptic clues, and uncover the truth behind the mystery.
              Every team has one chance — make it count.
            </p>

            {status === "loading" ? (
              <div
                className="h-14 w-56 animate-pulse rounded-xl bg-muted"
              />
            ) : (
              <Button
                size="lg"
                onClick={() => signIn("google")}
                className="h-14 px-8 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all rounded-xl"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#ffffff"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853" // Google green, keeping original for brand
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05" // Google yellow
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335" // Google red
                  />
                </svg>
                Sign in with Google
              </Button>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
           <Info className="h-4 w-4" /> A mystery-solving adventure by SherlockIT
        </p>
      </div>
    </div>
  );
}
