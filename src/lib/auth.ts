import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";
import crypto from "crypto";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.googleId = account.providerAccountId;
                token.email = profile.email;
                token.name = profile.name;

                await dbConnect();

                // First check if user is already a member of a team
                let team = await Team.findOne({
                    "members.googleId": account.providerAccountId,
                });

                // If not a member yet, check if their email matches a team leader
                if (!team && profile.email) {
                    team = await Team.findOne({
                        leaderEmail: profile.email.toLowerCase(),
                    });

                    // Auto-assign this user to their team
                    if (team) {
                        team.members.push({
                            googleId: account.providerAccountId,
                            email: profile.email,
                            name: profile.name || "",
                        });
                        await team.save();
                    }
                }

                if (team) {
                    token.teamId = team._id.toString();
                    token.teamName = team.teamName;

                    // Generate unique session ID and set it on the team
                    // This invalidates any previous session (single device enforcement)
                    const sessionId = crypto.randomUUID();
                    token.sessionId = sessionId;
                    team.activeSessionId = sessionId;
                    await team.save();
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.googleId = token.googleId as string;
                session.user.teamId = token.teamId as string | undefined;
                session.user.teamName = token.teamName as string | undefined;
                session.user.sessionId = token.sessionId as string | undefined;
            }
            return session;
        },
    },
    pages: {
        signIn: "/",
    },
};

export async function getAuthSession() {
    return getServerSession(authOptions);
}

// Helper to get team info for authenticated routes
export async function getTeamFromSession() {
    const session = await getAuthSession();
    if (!session?.user?.teamId) return null;

    await dbConnect();
    const team = await Team.findById(session.user.teamId);
    return team;
}
