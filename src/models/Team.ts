import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeamMember {
    googleId: string;
    email: string;
    name: string;
}

export interface ITeam extends Document {
    teamName: string;
    leaderEmail: string;
    members: ITeamMember[];
    activeSessionId: string | null;
    completedWorlds: mongoose.Types.ObjectId[];
    finalSubmitted: boolean;
}

const TeamMemberSchema = new Schema<ITeamMember>(
    {
        googleId: { type: String, required: true },
        email: { type: String, required: true },
        name: { type: String, required: true },
    },
    { _id: false }
);

const TeamSchema = new Schema<ITeam>(
    {
        teamName: { type: String, required: true, unique: true },
        leaderEmail: { type: String, required: true, unique: true },
        members: { type: [TeamMemberSchema], default: [] },
        activeSessionId: { type: String, default: null },
        completedWorlds: [{ type: Schema.Types.ObjectId, ref: "World" }],
        finalSubmitted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Team: Model<ITeam> =
    mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
