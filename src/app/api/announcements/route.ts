import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Announcement from "@/models/Announcement";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        await dbConnect();

        const announcements = await Announcement.find({})
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            announcements: announcements.map((a) => ({
                _id: a._id.toString(),
                message: a.message,
                createdAt: a.createdAt,
            })),
        });
    } catch (error) {
        console.error("Get announcements error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
