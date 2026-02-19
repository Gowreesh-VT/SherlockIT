"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function NotificationToast() {
  const { status } = useSession();
  const processedRef = useRef(new Set<string>());

  useEffect(() => {
    if (status !== "authenticated") return;

    // 1. Initial fetch to mark existing announcements as processed (don't show toasts for old ones)
    const initialFetch = async () => {
        try {
            const res = await fetch("/api/announcements/list");
            if (res.ok) {
                const data = await res.json();
                data.announcements.forEach((a: { _id: string }) => {
                    processedRef.current.add(a._id);
                });
            }
        } catch (e) {
            console.error("Initial announcement fetch failed:", e);
        }
    };
    initialFetch();

    // 2. Setup SSE (works on localhost/some hosting)
    const eventSource = new EventSource("/api/announcements/stream");

    eventSource.onmessage = (event) => {
      try {
        const announcement = JSON.parse(event.data);
        if (!processedRef.current.has(announcement._id)) {
            processedRef.current.add(announcement._id);
            showToast(announcement.message);
        }
      } catch {
        // Ignore parse errors
      }
    };

    // 3. Setup Polling (Fallback for Vercel/Serverless where SSE is isolated)
    const pollInterval = setInterval(async () => {
        try {
            // Fetch announcements from last 2 minutes just in case
            const since = new Date(Date.now() - 2 * 60 * 1000).toISOString();
            const res = await fetch(`/api/announcements/list?since=${since}`);
            if (res.ok) {
                const data = await res.json();
                data.announcements.forEach((a: { _id: string; message: string; createdAt: string }) => {
                    if (!processedRef.current.has(a._id)) {
                        processedRef.current.add(a._id);
                        showToast(a.message);
                    }
                });
            }
        } catch {
            // Ignore polling errors
        }
    }, 15000); // Check every 15 seconds

    return () => {
      eventSource.close();
      clearInterval(pollInterval);
    };
  }, [status]);

  return null;
}

function showToast(message: string) {
    toast(message, {
        duration: 8000,
        style: {
            background: "linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(18, 18, 30, 0.98))",
            border: "1px solid #ffc107",
            color: "#fff",
            fontSize: "0.95rem",
        },
        icon: "📢",
    });
}
