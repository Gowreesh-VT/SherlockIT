import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret");

export async function verifyAdmin(req: NextRequest): Promise<boolean> {
    // Method 1: JWT cookie (set by admin login page)
    const token = req.cookies.get("admin-token")?.value;
    if (token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            if (payload.role === "admin") return true;
        } catch {
            // Invalid token, fall through to next method
        }
    }

    // Method 2: x-admin-key header (sent by admin API client)
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey && adminKey === process.env.ADMIN_API_KEY) {
        return true;
    }

    return false;
}

export function unauthorizedResponse() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
