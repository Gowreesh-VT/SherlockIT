import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";
import World from "@/models/World";
import Progress from "@/models/Progress";

export async function GET(req: NextRequest) {
    if (!(await verifyAdmin(req))) return unauthorizedResponse();

    try {
        await dbConnect();

        const [teams, worlds] = await Promise.all([
            Team.find({}).lean(),
            World.find({}).sort({ order: 1 }).lean(),
        ]);

        // Get progress for all teams
        const progress = await Progress.find({}).lean();

        const teamsWithProgress = teams.map((team) => {
            const teamProgress = progress.filter(
                (p) => p.teamId.toString() === team._id.toString()
            );
            const completedWorldIds = teamProgress
                .filter((p) => p.completedAt)
                .map((p) => p.worldId.toString());

            return {
                _id: team._id.toString(),
                teamName: team.teamName,
                leaderEmail: team.leaderEmail,
                memberCount: team.members.length,
                completedWorlds: completedWorldIds.length,
                totalWorlds: worlds.length,
                finalSubmitted: team.finalSubmitted,
            };
        });

        return NextResponse.json({ teams: teamsWithProgress });
    } catch (error) {
        console.error("Admin get teams error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
