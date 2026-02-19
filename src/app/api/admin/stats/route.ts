import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";
import World from "@/models/World";
import Announcement from "@/models/Announcement";
import FinalSubmission from "@/models/FinalSubmission";

// GET /api/admin/stats - Dashboard statistics
export async function GET(req: NextRequest) {
  try {
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const [
      totalTeams,
      activeTeams,
      totalWorlds,
      unlockedWorlds,
      totalAnnouncements,
      finalSubmissions,
    ] = await Promise.all([
      Team.countDocuments(),
      Team.countDocuments({ "completedWorlds.0": { $exists: true } }),
      World.countDocuments(),
      World.countDocuments({ isLocked: false }),
      Announcement.countDocuments(),
      FinalSubmission.countDocuments(),
    ]);

    return NextResponse.json({
      totalTeams,
      activeTeams,
      totalWorlds,
      unlockedWorlds,
      totalAnnouncements,
      finalSubmissions,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
