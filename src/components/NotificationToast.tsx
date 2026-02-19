"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function NotificationToast() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    // Connect to SSE stream — server only pushes when admin sends a notification
    const eventSource = new EventSource("/api/announcements/stream");

    eventSource.onmessage = (event) => {
      try {
        const announcement = JSON.parse(event.data);
        toast(announcement.message, {
          duration: 8000,
          style: {
            background: "linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(18, 18, 30, 0.98))",
            border: "1px solid #ffc107",
            color: "#fff",
            fontSize: "0.95rem",
          },
          icon: "📢",
        });
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      // EventSource auto-reconnects on error
    };

    return () => {
      eventSource.close();
    };
  }, [status]);

  return null; // Logic only, UI handled by Sonner Toaster in layout
}
