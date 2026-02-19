import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import dbConnect from "@/lib/db";
import FinalSubmission from "@/models/FinalSubmission";
import EventControl from "@/models/EventControl";

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

// GET /api/admin/submissions - Get all final submissions with evaluation
export async function GET(req: NextRequest) {
  try {
    if (!(await verifyAdmin(req))) return unauthorizedResponse();

    await dbConnect();

    const [submissions, eventControl] = await Promise.all([
      FinalSubmission.find()
        .populate("teamId", "teamName leaderEmail")
        .sort({ submittedAt: -1 })
        .lean(),
      EventControl.findOne({}).lean(),
    ]);

    const correctRealWorld = normalize(eventControl?.correctRealWorld || "Paris");
    const correctVillain = normalize(eventControl?.correctVillain || "Moriarty");
    const correctWeapon = normalize(eventControl?.correctWeapon || "Dagger");
    const hasCorrectAnswers = !!(correctRealWorld && correctVillain && correctWeapon);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedSubmissions = submissions.map((sub: any) => {
      const realWorldCorrect = hasCorrectAnswers && normalize(sub.realWorld) === correctRealWorld;
      const villainCorrect = hasCorrectAnswers && normalize(sub.villain) === correctVillain;
      const weaponCorrect = hasCorrectAnswers && normalize(sub.weapon) === correctWeapon;
      const score = (realWorldCorrect ? 1 : 0) + (villainCorrect ? 1 : 0) + (weaponCorrect ? 1 : 0);

      return {
        id: sub._id,
        teamId: sub.teamId?._id || sub.teamId,
        teamName: sub.teamId?.teamName || "Unknown Team",
        leaderEmail: sub.teamId?.leaderEmail || "N/A",
        realWorld: sub.realWorld,
        villain: sub.villain,
        weapon: sub.weapon,
        submittedAt: sub.submittedAt || sub.createdAt,
        realWorldCorrect,
        villainCorrect,
        weaponCorrect,
        score,
        isWinner: score === 3,
      };
    });

    // Sort winners by earliest submission
    const winners = formattedSubmissions
      .filter((s: { isWinner: boolean }) => s.isWinner)
      .sort((a: { submittedAt: string }, b: { submittedAt: string }) =>
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      );

    return NextResponse.json({
      submissions: formattedSubmissions,
      totalSubmissions: formattedSubmissions.length,
      hasCorrectAnswers,
      correctAnswers: hasCorrectAnswers ? {
        realWorld: correctRealWorld,
        villain: correctVillain,
        weapon: correctWeapon,
      } : null,
      winners,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
