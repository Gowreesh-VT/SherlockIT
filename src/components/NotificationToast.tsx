"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function NotificationToast() {
  const { status } = useSession();
  const [lastChecked, setLastChecked] = useState<string>("");

  useEffect(() => {
    // Set initial check time to now so we only show NEW announcements
    if (status === "authenticated") {
      setLastChecked(new Date().toISOString());
    }
  }, [status]);

  useEffect(() => {
    if (!lastChecked || status !== "authenticated") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/announcements/latest?since=${encodeURIComponent(lastChecked)}`);
        if (!res.ok) return;

        const data = await res.json();

        if (data.announcements && data.announcements.length > 0) {
          // Update lastChecked to the newest announcement time
          setLastChecked(new Date().toISOString());

          // Show notifications
          data.announcements.forEach((ann: { message: string }) => {
            toast(ann.message, {
              duration: 8000,
              style: {
                background: "linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(18, 18, 30, 0.98))",
                border: "1px solid #ffc107",
                color: "#fff",
                fontSize: "0.95rem",
              },
              icon: "📢",
            });
          });
        }
      } catch {
        // Silently fail
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [lastChecked, status]);

  return null; // Logic only, UI handled by Sonner Toaster in layout
}
