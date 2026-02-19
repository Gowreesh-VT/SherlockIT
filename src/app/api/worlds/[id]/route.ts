import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import World from "@/models/World";
import Team from "@/models/Team";
import Progress from "@/models/Progress";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        const team = await Team.findOne({
            "members.googleId": session.user.googleId,
        });

        if (!team) {
            return NextResponse.json({ error: "Not part of a team" }, { status: 403 });
        }

        const world = await World.findById(id).lean();

        if (!world) {
            return NextResponse.json({ error: "World not found" }, { status: 404 });
        }

        if (world.isLocked) {
            return NextResponse.json(
                { error: "This world is locked" },
                { status: 403 }
            );
        }

        // Get progress for this team + world
        const progress = await Progress.findOne({
            teamId: team._id,
            worldId: world._id,
        }).lean();

        const isCompleted = team.completedWorlds.some(
            (cw: { toString: () => string }) => cw.toString() === world._id.toString()
        );

        return NextResponse.json({
            _id: world._id.toString(),
            title: world.title,
            story: world.story,
            question: world.question,
            order: world.order,
            isCompleted,
            attempts: progress?.attempts || 0,
        });
    } catch (error) {
        console.error("Get world error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
