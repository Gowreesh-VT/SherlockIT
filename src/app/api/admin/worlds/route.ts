import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import World from "@/models/World";

// GET /api/admin/worlds - Get all worlds
export async function GET(req: NextRequest) {
  try {
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const worlds = await World.find().sort({ order: 1 }).lean();

    const formattedWorlds = worlds.map((world) => ({
      id: world._id,
      title: world.title,
      story: world.story,
      question: world.question,
      answer: world.answer,
      order: world.order,
      isLocked: world.isLocked,
    }));

    return NextResponse.json({ worlds: formattedWorlds });
  } catch (error) {
    console.error("Error fetching worlds:", error);
    return NextResponse.json(
      { error: "Failed to fetch worlds" },
      { status: 500 }
    );
  }
}

// POST /api/admin/worlds - Create a new world
export async function POST(req: NextRequest) {
  try {
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { title, story, question, answer, order, isLocked } = body;

    if (!title || !story || !question || !answer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newWorld = await World.create({
      title,
      story,
      question,
      answer,
      order: order ?? (await World.countDocuments()) + 1,
      isLocked: isLocked ?? true,
    });

    return NextResponse.json(
      { message: "World created", world: newWorld },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating world:", error);
    return NextResponse.json(
      { error: "Failed to create world" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/worlds - Bulk operations (lock all / unlock all)
export async function PATCH(req: NextRequest) {
  try {
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { action } = body;

    if (action === "lock-all") {
      await World.updateMany({}, { isLocked: true });
      return NextResponse.json({ message: "All worlds locked" });
    }

    if (action === "unlock-all") {
      await World.updateMany({}, { isLocked: false });
      return NextResponse.json({ message: "All worlds unlocked" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating worlds:", error);
    return NextResponse.json(
      { error: "Failed to update worlds" },
      { status: 500 }
    );
  }
}
