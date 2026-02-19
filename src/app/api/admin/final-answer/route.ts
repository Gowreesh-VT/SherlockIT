import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import EventControl from "@/models/EventControl";

// Helper to get or create event control
async function getEventControl() {
  let eventControl = await EventControl.findOne();
  if (!eventControl) {
    eventControl = await EventControl.create({
      finalAnswerOpen: false,
      finalAnswerStartTime: null,
    });
  }
  return eventControl;
}

// GET /api/admin/final-answer - Get final answer status
export async function GET(req: NextRequest) {
  try {
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const eventControl = await getEventControl();

    return NextResponse.json({
      finalAnswerOpen: eventControl.finalAnswerOpen,
      finalAnswerStartTime: eventControl.finalAnswerStartTime,
    });
  } catch (error) {
    console.error("Error fetching final answer status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}

// POST /api/admin/final-answer - Toggle final answer status
export async function POST(req: NextRequest) {
  try {
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { action } = body;

    const eventControl = await getEventControl();

    if (action === "open") {
      eventControl.finalAnswerOpen = true;
      eventControl.finalAnswerStartTime = new Date();
      await eventControl.save();
      return NextResponse.json({
        message: "Final answer submissions opened",
        finalAnswerOpen: true,
        finalAnswerStartTime: eventControl.finalAnswerStartTime,
      });
    }

    if (action === "close") {
      eventControl.finalAnswerOpen = false;
      await eventControl.save();
      return NextResponse.json({
        message: "Final answer submissions closed",
        finalAnswerOpen: false,
      });
    }

    if (action === "toggle") {
      eventControl.finalAnswerOpen = !eventControl.finalAnswerOpen;
      if (eventControl.finalAnswerOpen) {
        eventControl.finalAnswerStartTime = new Date();
      }
      await eventControl.save();
      return NextResponse.json({
        message: eventControl.finalAnswerOpen
          ? "Final answer submissions opened"
          : "Final answer submissions closed",
        finalAnswerOpen: eventControl.finalAnswerOpen,
        finalAnswerStartTime: eventControl.finalAnswerStartTime,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error toggling final answer:", error);
    return NextResponse.json(
      { error: "Failed to toggle status" },
      { status: 500 }
    );
  }
}
