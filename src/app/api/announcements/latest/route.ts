import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Announcement from "@/models/Announcement";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const since = req.nextUrl.searchParams.get("since");

        if (!since) {
            return NextResponse.json({ announcements: [] });
        }

        await dbConnect();

        const sinceDate = new Date(since);

        // Get announcements created after the given timestamp
        const announcements = await Announcement.find({
            createdAt: { $gt: sinceDate },
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        return NextResponse.json({
            announcements: announcements.map((a) => ({
                _id: a._id.toString(),
                message: a.message,
                createdAt: a.createdAt,
            })),
        });
    } catch (error) {
        console.error("Get latest announcements error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
