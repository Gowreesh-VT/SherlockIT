import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import World from "@/models/World";
import Team from "@/models/Team";
import Progress from "@/models/Progress";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { worldId, answer } = await req.json();

        if (!worldId || !answer) {
            return NextResponse.json(
                { error: "World ID and answer are required" },
                { status: 400 }
            );
        }

        await dbConnect();

        const team = await Team.findOne({
            "members.googleId": session.user.googleId,
        });

        if (!team) {
            return NextResponse.json({ error: "Not part of a team" }, { status: 403 });
        }

        const world = await World.findById(worldId);

        if (!world) {
            return NextResponse.json({ error: "World not found" }, { status: 404 });
        }

        if (world.isLocked) {
            return NextResponse.json(
                { error: "This world is locked" },
                { status: 403 }
            );
        }

        // Already completed?
        const alreadyCompleted = team.completedWorlds.some(
            (cw: { toString: () => string }) => cw.toString() === world._id.toString()
        );

        if (alreadyCompleted) {
            return NextResponse.json({
                correct: true,
                alreadyCompleted: true,
                message: "You already completed this world!",
            });
        }

        // Update or create progress (track attempts)
        await Progress.findOneAndUpdate(
            { teamId: team._id, worldId: world._id },
            { $inc: { attempts: 1 } },
            { upsert: true, new: true }
        );

        // Case-insensitive, trimmed comparison
        const isCorrect =
            answer.trim().toLowerCase() === world.answer.trim().toLowerCase();

        if (!isCorrect) {
            return NextResponse.json({
                correct: false,
                message: "Incorrect answer. Try again!",
            });
        }

        // Mark world as completed
        team.completedWorlds.push(world._id);
        await team.save();

        // Update progress with completion time
        await Progress.findOneAndUpdate(
            { teamId: team._id, worldId: world._id },
            { completedAt: new Date() }
        );

        // Check if next world should be unlocked
        const nextWorld = await World.findOne({ order: world.order + 1 });
        let nextWorldUnlocked = false;

        if (nextWorld && nextWorld.isLocked) {
            nextWorld.isLocked = false;
            await nextWorld.save();
            nextWorldUnlocked = true;
        }

        return NextResponse.json({
            correct: true,
            alreadyCompleted: false,
            message: "Correct! Well done, detective! 🎉",
            nextWorldUnlocked,
            nextWorldTitle: nextWorld?.title || null,
        });
    } catch (error) {
        console.error("Submit answer error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
