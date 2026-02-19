import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import World from "@/models/World";

// GET /api/admin/worlds/[id] - Get a single world
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const world = await World.findById(id).lean();

    if (!world) {
      return NextResponse.json({ error: "World not found" }, { status: 404 });
    }

    return NextResponse.json({ world });
  } catch (error) {
    console.error("Error fetching world:", error);
    return NextResponse.json(
      { error: "Failed to fetch world" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/worlds/[id] - Update a world
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const body = await req.json();

    const allowedFields = ["title", "story", "question", "answer", "order", "isLocked"];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const world = await World.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!world) {
      return NextResponse.json({ error: "World not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "World updated", world });
  } catch (error) {
    console.error("Error updating world:", error);
    return NextResponse.json(
      { error: "Failed to update world" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/worlds/[id] - Delete a world
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const world = await World.findByIdAndDelete(id);

    if (!world) {
      return NextResponse.json({ error: "World not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "World deleted" });
  } catch (error) {
    console.error("Error deleting world:", error);
    return NextResponse.json(
      { error: "Failed to delete world" },
      { status: 500 }
    );
  }
}
