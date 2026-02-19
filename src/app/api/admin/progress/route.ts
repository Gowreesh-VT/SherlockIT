import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";
import World from "@/models/World";
import Progress from "@/models/Progress";

// GET /api/admin/progress - Get detailed progress for all teams
export async function GET(req: NextRequest) {
  try {
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const [teams, worlds, progressRecords] = await Promise.all([
      Team.find().populate("completedWorlds", "title order").lean(),
      World.find().sort({ order: 1 }).lean(),
      Progress.find().populate("teamId", "teamName").populate("worldId", "title order").lean(),
    ]);

    const totalWorlds = worlds.length;

    // Build detailed progress per team
    const teamsProgress = teams.map((team) => {
      const completedWorldIds = (team.completedWorlds || []).map((w: { _id: { toString: () => string } }) => w._id.toString());
      
      return {
        id: team._id,
        teamName: team.teamName,
        completedCount: completedWorldIds.length,
        totalWorlds,
        progressPercent: totalWorlds > 0 
          ? Math.round((completedWorldIds.length / totalWorlds) * 100) 
          : 0,
        completedWorlds: team.completedWorlds || [],
        finalSubmitted: team.finalSubmitted,
        lastActive: team.updatedAt,
      };
    });

    // Sort by progress (descending)
    teamsProgress.sort((a, b) => b.progressPercent - a.progressPercent);

    // Summary stats
    const summary = {
      totalTeams: teams.length,
      teamsCompleted100: teamsProgress.filter((t) => t.progressPercent === 100).length,
      teamsOver50: teamsProgress.filter((t) => t.progressPercent >= 50).length,
      teamsStarted: teamsProgress.filter((t) => t.completedCount > 0).length,
      averageProgress: teamsProgress.length > 0
        ? Math.round(teamsProgress.reduce((sum, t) => sum + t.progressPercent, 0) / teamsProgress.length)
        : 0,
    };

    return NextResponse.json({
      summary,
      teams: teamsProgress,
      worlds: worlds.map((w) => ({ id: w._id, title: w.title, order: w.order })),
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
