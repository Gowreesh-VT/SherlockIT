import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Announcement from "@/models/Announcement";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        await dbConnect();

        // Get query param 'since' (timestamp)
        const { searchParams } = new URL(req.url);
        const since = searchParams.get("since");

        let query = {};
        if (since) {
            query = { createdAt: { $gt: new Date(since) } };
        }

        // Fetch last 5 announcements or those since 'since'
        const announcements = await Announcement.find(query)
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        return NextResponse.json({ announcements });
    } catch (error) {
        console.error("Fetch announcements error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
