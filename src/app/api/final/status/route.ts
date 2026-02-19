import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import EventControl from "@/models/EventControl";
import Team from "@/models/Team";
import FinalSubmission from "@/models/FinalSubmission";

export async function GET() {
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

        // Get event control
        const eventControl = await EventControl.findOne({}).lean();

        if (!eventControl) {
            return NextResponse.json({
                isOpen: false,
                alreadySubmitted: false,
                message: "Final answer is not available yet.",
            });
        }

        const isOpen = eventControl.finalAnswerOpen;

        // Check if team already submitted
        const existingSubmission = await FinalSubmission.findOne({
            teamId: team._id,
        }).lean();

        return NextResponse.json({
            isOpen,
            deadline: eventControl.finalAnswerDeadline || null,
            alreadySubmitted: !!existingSubmission,
            submission: existingSubmission
                ? {
                    realWorld: existingSubmission.realWorld,
                    villain: existingSubmission.villain,
                    weapon: existingSubmission.weapon,
                    submittedAt: existingSubmission.submittedAt,
                }
                : null,
        });
    } catch (error) {
        console.error("Final status error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
