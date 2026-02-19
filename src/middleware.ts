import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret");

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // --- Admin page protection ---
    if (pathname.startsWith("/admin")) {
        // Allow admin login page
        if (pathname === "/admin/login") {
            return NextResponse.next();
        }

        // Check admin-token JWT cookie
        const adminToken = req.cookies.get("admin-token")?.value;
        if (!adminToken) {
            return NextResponse.redirect(new URL("/admin/login", req.url));
        }

        try {
            const { payload } = await jwtVerify(adminToken, JWT_SECRET);
            if (payload.role !== "admin") {
                return NextResponse.redirect(new URL("/admin/login", req.url));
            }
        } catch {
            // Invalid or expired token
            return NextResponse.redirect(new URL("/admin/login", req.url));
        }

        return NextResponse.next();
    }

    // --- Team page protection (NextAuth session) ---
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/dashboard/:path*",
        "/world/:path*",
        "/final/:path*",
        "/announcements/:path*",
    ],
};
