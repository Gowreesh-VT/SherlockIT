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
            correctRealWorld: control.correctRealWorld || "",
            correctVillain: control.correctVillain || "",
            correctWeapon: control.correctWeapon || "",
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
        const { finalAnswerOpen, durationMinutes } = await req.json();
        await dbConnect();

        let control = await EventControl.findOne({});
        if (!control) {
            control = await EventControl.create({
                finalAnswerOpen: false,
                finalAnswerStartTime: null,
                finalAnswerDeadline: null,
            });
        }

        control.finalAnswerOpen = finalAnswerOpen;
        if (finalAnswerOpen && !control.finalAnswerStartTime) {
            control.finalAnswerStartTime = new Date();
            if (durationMinutes && durationMinutes > 0) {
                control.finalAnswerDeadline = new Date(Date.now() + durationMinutes * 60 * 1000);
            }
        }
        if (!finalAnswerOpen) {
            control.finalAnswerStartTime = null;
            control.finalAnswerDeadline = null;
        }

        await control.save();

        return NextResponse.json({
            success: true,
            finalAnswerOpen: control.finalAnswerOpen,
            finalAnswerStartTime: control.finalAnswerStartTime,
            finalAnswerDeadline: control.finalAnswerDeadline,
        });
    } catch (error) {
        console.error("Admin toggle event control error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH - save correct answers
export async function PATCH(req: NextRequest) {
    if (!(await verifyAdmin(req))) return unauthorizedResponse();

    try {
        const { correctRealWorld, correctVillain, correctWeapon } = await req.json();
        await dbConnect();

        let control = await EventControl.findOne({});
        if (!control) {
            control = await EventControl.create({
                finalAnswerOpen: false,
                finalAnswerStartTime: null,
                finalAnswerDeadline: null,
            });
        }

        if (correctRealWorld !== undefined) control.correctRealWorld = correctRealWorld.trim();
        if (correctVillain !== undefined) control.correctVillain = correctVillain.trim();
        if (correctWeapon !== undefined) control.correctWeapon = correctWeapon.trim();

        await control.save();

        return NextResponse.json({
            success: true,
            correctRealWorld: control.correctRealWorld,
            correctVillain: control.correctVillain,
            correctWeapon: control.correctWeapon,
        });
    } catch (error) {
        console.error("Admin save correct answers error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
