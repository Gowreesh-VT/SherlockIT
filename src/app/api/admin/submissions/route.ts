import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import FinalSubmission from "@/models/FinalSubmission";

// GET /api/admin/submissions - Get all final submissions
export async function GET(req: NextRequest) {
  try {
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const submissions = await FinalSubmission.find()
      .populate("teamId", "teamName leaderEmail")
      .sort({ submittedAt: -1 })
      .lean();

    const formattedSubmissions = submissions.map((sub) => ({
      id: sub._id,
      teamId: sub.teamId?._id || sub.teamId,
      teamName: sub.teamId?.teamName || "Unknown Team",
      leaderEmail: sub.teamId?.leaderEmail || "N/A",
      answer: sub.answer,
      submittedAt: sub.submittedAt || sub.createdAt,
    }));

    return NextResponse.json({
      submissions: formattedSubmissions,
      totalSubmissions: formattedSubmissions.length,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
