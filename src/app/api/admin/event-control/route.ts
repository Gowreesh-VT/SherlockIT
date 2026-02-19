import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import dbConnect from "@/lib/db";
import EventControl from "@/models/EventControl";

// GET current event control status
export async function GET(req: NextRequest) {
    if (!(await verifyAdmin(req))) return unauthorizedResponse();

    try {
        await dbConnect();
        let control = await EventControl.findOne({}).lean();

        if (!control) {
            control = await EventControl.create({
                finalAnswerOpen: false,
                finalAnswerStartTime: null,
            });
        }

        return NextResponse.json({
            finalAnswerOpen: control.finalAnswerOpen,
            finalAnswerStartTime: control.finalAnswerStartTime,
        });
    } catch (error) {
        console.error("Admin get event control error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST toggle final answer
export async function POST(req: NextRequest) {
    if (!(await verifyAdmin(req))) return unauthorizedResponse();

    try {
        const { finalAnswerOpen } = await req.json();
        await dbConnect();

        let control = await EventControl.findOne({});
        if (!control) {
            control = await EventControl.create({
                finalAnswerOpen: false,
                finalAnswerStartTime: null,
            });
        }

        control.finalAnswerOpen = finalAnswerOpen;
        if (finalAnswerOpen && !control.finalAnswerStartTime) {
            control.finalAnswerStartTime = new Date();
        }
        if (!finalAnswerOpen) {
            control.finalAnswerStartTime = null;
        }

        await control.save();

        return NextResponse.json({
            success: true,
            finalAnswerOpen: control.finalAnswerOpen,
            finalAnswerStartTime: control.finalAnswerStartTime,
        });
    } catch (error) {
        console.error("Admin toggle event control error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
