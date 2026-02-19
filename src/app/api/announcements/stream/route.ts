import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { announcementEmitter } from "@/lib/announcement-emitter";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            // Send a heartbeat comment every 30s to keep proxy connections alive
            const heartbeat = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(": heartbeat\n\n"));
                } catch {
                    clearInterval(heartbeat);
                }
            }, 30000);

            // Listen for new announcements
            const unsubscribe = announcementEmitter.subscribe((announcement) => {
                try {
                    const data = JSON.stringify(announcement);
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                } catch {
                    // Client disconnected
                    unsubscribe();
                    clearInterval(heartbeat);
                }
            });

            // Send initial connection confirmation
            controller.enqueue(encoder.encode(": connected\n\n"));

            // Cleanup on abort
            const cleanup = () => {
                unsubscribe();
                clearInterval(heartbeat);
            };

            // Store cleanup for when the stream is cancelled
            (controller as unknown as { _cleanup: () => void })._cleanup = cleanup;
        },
        cancel(controller) {
            const cleanup = (controller as unknown as { _cleanup?: () => void })?._cleanup;
            if (cleanup) cleanup();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}
