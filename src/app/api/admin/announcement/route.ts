import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import dbConnect from "@/lib/db";
import Announcement from "@/models/Announcement";

const TEMPLATES: Record<string, string> = {
    "welcome": "🕵️ Welcome to SherlockIT 2.0! The mystery begins now. Good luck, detectives!",
    "halfway": "⏰ You're halfway through! Keep going, the truth is within reach!",
    "hint": "🔍 Hint: Pay close attention to the storylines. The answers are closer than you think!",
    "final-open": "🚨 FINAL ANSWER IS NOW OPEN! You have 30 minutes to submit your answer. Go to the Final Answer section NOW!",
    "final-closing": "⏳ Only 10 minutes left to submit your final answer! Don't miss your chance!",
    "final-closed": "🔒 Final answer submission is now CLOSED. Thank you for participating!",
    "break": "☕ Take a 5-minute break! Grab some refreshments and come back stronger.",
    "update": "📢 Event update: Please check your dashboard for the latest world status.",
    "congrats": "🎉 Congratulations! A team has solved all the worlds! Can you keep up?",
    "last-world": "🌟 New world unlocked! The final world is now available for all teams.",
};

const TEMPLATE_LIST = [
    { id: "welcome", label: "🕵️ Welcome", message: TEMPLATES["welcome"] },
    { id: "halfway", label: "⏰ Halfway", message: TEMPLATES["halfway"] },
    { id: "hint", label: "🔍 Hint", message: TEMPLATES["hint"] },
    { id: "final-open", label: "🚨 Final Open", message: TEMPLATES["final-open"] },
    { id: "final-closing", label: "⏳ Final Closing", message: TEMPLATES["final-closing"] },
    { id: "final-closed", label: "🔒 Final Closed", message: TEMPLATES["final-closed"] },
    { id: "break", label: "☕ Break Time", message: TEMPLATES["break"] },
    { id: "update", label: "📢 Update", message: TEMPLATES["update"] },
    { id: "congrats", label: "🎉 Congrats", message: TEMPLATES["congrats"] },
    { id: "last-world", label: "🌟 Last World", message: TEMPLATES["last-world"] },
];

// Authenticate via either JWT cookie (admin dashboard) or API key (external admin panel)
async function isAuthed(req: NextRequest): Promise<boolean> {
    // Check cookie first
    if (await verifyAdmin(req)) return true;
    // Fallback to API key header
    const adminKey = req.headers.get("x-admin-key");
    return adminKey === process.env.ADMIN_API_KEY;
}

export async function POST(req: NextRequest) {
    if (!(await isAuthed(req))) return unauthorizedResponse();

    try {
        const { message, templateId } = await req.json();

        let announcementMessage = message;

        if (templateId && !message) {
            announcementMessage = TEMPLATES[templateId];
            if (!announcementMessage) {
                return NextResponse.json(
                    { error: "Invalid template ID", availableTemplates: Object.keys(TEMPLATES) },
                    { status: 400 }
                );
            }
        }

        if (!announcementMessage) {
            return NextResponse.json(
                { error: "Either 'message' or 'templateId' is required" },
                { status: 400 }
            );
        }

        await dbConnect();
        const announcement = await Announcement.create({ message: announcementMessage });

        return NextResponse.json({
            success: true,
            announcement: {
                _id: announcement._id.toString(),
                message: announcement.message,
                createdAt: announcement.createdAt,
            },
        });
    } catch (error) {
        console.error("Send announcement error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    if (!(await isAuthed(req))) return unauthorizedResponse();
    return NextResponse.json({ templates: TEMPLATE_LIST });
}
