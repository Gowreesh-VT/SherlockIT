/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            googleId?: string;
            teamId?: string;
            teamName?: string;
            sessionId?: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        googleId?: string;
        teamId?: string;
        teamName?: string;
        sessionId?: string;
    }
}
