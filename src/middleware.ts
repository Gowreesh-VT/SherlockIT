import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: ["/dashboard/:path*", "/world/:path*", "/final/:path*", "/announcements/:path*", "/api/admin/:path*"],
};
