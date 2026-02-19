import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import World from "@/models/World";
import Team from "@/models/Team";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        await dbConnect();

        // Find user's team
        const team = await Team.findOne({
            "members.googleId": session.user.googleId,
        });

        if (!team) {
            return NextResponse.json({ error: "Not part of a team" }, { status: 403 });
        }

        // Get all worlds sorted by order
        const worlds = await World.find({}).sort({ order: 1 }).lean();

        // Map worlds with completion status
        const worldsWithStatus = worlds.map((world) => ({
            _id: world._id.toString(),
            title: world.title,
            order: world.order,
            isLocked: world.isLocked,
            isCompleted: team.completedWorlds.some(
                (cw: { toString: () => string }) => cw.toString() === world._id.toString()
            ),
        }));

        return NextResponse.json({
            worlds: worldsWithStatus,
            teamName: team.teamName,
            teamId: team._id.toString(),
        });
    } catch (error) {
        console.error("Get worlds error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
