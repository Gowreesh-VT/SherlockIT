import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";
import World from "@/models/World";

// GET /api/admin/teams - Get all teams with progress
export async function GET(req: NextRequest) {
  try {
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const teams = await Team.find()
      .populate("completedWorlds", "title order")
      .sort({ createdAt: -1 })
      .lean();

    const totalWorlds = await World.countDocuments();

    const teamsWithProgress = teams.map((team) => ({
      id: team._id,
      teamName: team.teamName,
      leaderEmail: team.leaderEmail,
      membersCount: team.members?.length || 0,
      completedWorlds: team.completedWorlds || [],
      completedWorldsCount: team.completedWorlds?.length || 0,
      totalWorlds,
      progress: totalWorlds > 0 
        ? Math.round(((team.completedWorlds?.length || 0) / totalWorlds) * 100) 
        : 0,
      finalSubmitted: team.finalSubmitted,
      lastActive: team.updatedAt,
    }));

    return NextResponse.json({ teams: teamsWithProgress, totalWorlds });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
