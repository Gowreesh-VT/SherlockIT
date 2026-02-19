import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret");

export async function verifyAdmin(req: NextRequest): Promise<boolean> {
    const token = req.cookies.get("admin-token")?.value;
    if (!token) return false;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.role === "admin";
    } catch {
        return false;
    }
}

export function unauthorizedResponse() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
