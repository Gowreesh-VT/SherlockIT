import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ success: true });

    response.cookies.set("admin-token", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0, // Delete the cookie
    });

    return response;
}
