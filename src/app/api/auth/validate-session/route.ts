import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";

// Validates that the current session is still the active one for this team
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.teamId || !session?.user?.sessionId) {
            return NextResponse.json({ valid: false, reason: "no-session" });
        }

        await dbConnect();
        const team = await Team.findById(session.user.teamId).select("activeSessionId").lean();

        if (!team) {
            return NextResponse.json({ valid: false, reason: "no-team" });
        }

        if (team.activeSessionId !== session.user.sessionId) {
            return NextResponse.json({
                valid: false,
                reason: "session-replaced",
                message: "Another device has logged in with this team. You have been signed out.",
            });
        }

        return NextResponse.json({ valid: true });
    } catch (error) {
        console.error("Session validation error:", error);
        return NextResponse.json({ valid: true }); // Don't kick users on server errors
    }
}
