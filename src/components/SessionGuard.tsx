"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut, ShieldAlert } from "lucide-react";

/**
 * SessionGuard - Polls the server every 10 seconds to check if this session
 * is still the active one. If another device has logged in for this team,
 * shows a modal and forces sign-out.
 */
export default function SessionGuard() {
  const [kicked, setKicked] = useState(false);

  useEffect(() => {
    async function validateSession() {
      try {
        const res = await fetch("/api/auth/validate-session");
        if (!res.ok) return;

        const data = await res.json();

        if (!data.valid && data.reason === "session-replaced") {
          setKicked(true);
          // Auto sign-out after 5 seconds
          setTimeout(() => {
            signOut({ callbackUrl: "/" });
          }, 5000);
        }
      } catch {
        // Silently fail on network errors
      }
    }

    // Check immediately on mount
    validateSession();

    // Then poll every 10 seconds
    const interval = setInterval(validateSession, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AlertDialog open={kicked}>
      <AlertDialogContent className="border-destructive/50 bg-destructive/5">
        <AlertDialogHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center text-xl text-destructive font-bold">
            Session Expired
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center py-2 text-foreground/80">
            Another device has logged in with your team account.
            <br />
            <strong>Only one device can be active at a time.</strong>
          </AlertDialogDescription>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Redirecting to login in 5 seconds...
          </p>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-white"
            >
                <LogOut className="mr-2 h-4 w-4" /> Sign Out Now
            </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
