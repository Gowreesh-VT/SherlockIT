import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProgress extends Document {
    teamId: mongoose.Types.ObjectId;
    worldId: mongoose.Types.ObjectId;
    attempts: number;
    completedAt: Date | null;
}

const ProgressSchema = new Schema<IProgress>(
    {
        teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
        worldId: { type: Schema.Types.ObjectId, ref: "World", required: true },
        attempts: { type: Number, default: 0 },
        completedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

ProgressSchema.index({ teamId: 1, worldId: 1 }, { unique: true });

const Progress: Model<IProgress> =
    mongoose.models.Progress ||
    mongoose.model<IProgress>("Progress", ProgressSchema);

export default Progress;
