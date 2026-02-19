import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret");

export async function POST(req: NextRequest) {
    try {
        const { password } = await req.json();

        if (!password || password !== ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: "Invalid password" },
                { status: 401 }
            );
        }

        // Create a JWT token for admin session
        const token = await new SignJWT({ role: "admin" })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("12h")
            .sign(JWT_SECRET);

        const response = NextResponse.json({ success: true });

        // Set the admin token as an httpOnly cookie
        response.cookies.set("admin-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 12, // 12 hours
        });

        return response;
    } catch (error) {
        console.error("Admin login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
