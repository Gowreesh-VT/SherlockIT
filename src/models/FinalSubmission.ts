import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFinalSubmission extends Document {
    teamId: mongoose.Types.ObjectId;
    realWorld: string;
    villain: string;
    weapon: string;
    submittedAt: Date;
}

const FinalSubmissionSchema = new Schema<IFinalSubmission>(
    {
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: true,
            unique: true,
        },
        realWorld: { type: String, required: true },
        villain: { type: String, required: true },
        weapon: { type: String, required: true },
        submittedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const FinalSubmission: Model<IFinalSubmission> =
    mongoose.models.FinalSubmission ||
    mongoose.model<IFinalSubmission>("FinalSubmission", FinalSubmissionSchema);

export default FinalSubmission;
