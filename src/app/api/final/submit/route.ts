import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import EventControl from "@/models/EventControl";
import Team from "@/models/Team";
import FinalSubmission from "@/models/FinalSubmission";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        await dbConnect();

        const team = await Team.findOne({
            "members.googleId": session.user.googleId,
        });

        if (!team) {
            return NextResponse.json({ error: "Not part of a team" }, { status: 403 });
        }

        // Check if final answer is open
        const eventControl = await EventControl.findOne({}).lean();
        if (!eventControl?.finalAnswerOpen) {
            return NextResponse.json(
                { error: "Final answer submission is not open yet." },
                { status: 403 }
            );
        }

        // Check if already submitted (double-check with DB)
        const existingSubmission = await FinalSubmission.findOne({
            teamId: team._id,
        });

        if (existingSubmission) {
            return NextResponse.json(
                { error: "Your team has already submitted the final answer." },
                { status: 409 }
            );
        }

        const { realWorld, villain, weapon } = await req.json();

        if (!realWorld?.trim() || !villain?.trim() || !weapon?.trim()) {
            return NextResponse.json(
                { error: "All fields (Real World, Villain, Weapon) are required." },
                { status: 400 }
            );
        }

        // Create submission with server timestamp
        const submission = await FinalSubmission.create({
            teamId: team._id,
            realWorld: realWorld.trim(),
            villain: villain.trim(),
            weapon: weapon.trim(),
            submittedAt: new Date(),
        });

        // Mark team as having submitted
        team.finalSubmitted = true;
        await team.save();

        return NextResponse.json({
            success: true,
            message: "Final answer submitted successfully! 🎉",
            submission: {
                realWorld: submission.realWorld,
                villain: submission.villain,
                weapon: submission.weapon,
                submittedAt: submission.submittedAt,
            },
        });
    } catch (error: unknown) {
        // Handle unique index violation (race condition protection)
        if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 11000) {
            return NextResponse.json(
                { error: "Your team has already submitted the final answer." },
                { status: 409 }
            );
        }

        console.error("Final submit error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
