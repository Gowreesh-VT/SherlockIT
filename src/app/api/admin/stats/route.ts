import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";
import World from "@/models/World";
import Announcement from "@/models/Announcement";
import FinalSubmission from "@/models/FinalSubmission";

// GET /api/admin/stats - Dashboard statistics
export async function GET(req: NextRequest) {
  try {
    if (!(await verifyAdmin(req))) return unauthorizedResponse();

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
