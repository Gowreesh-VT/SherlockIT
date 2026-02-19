import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEventControl extends Document {
    finalAnswerOpen: boolean;
    finalAnswerStartTime: Date | null;
    finalAnswerDeadline: Date | null;
    correctRealWorld: string;
    correctVillain: string;
    correctWeapon: string;
}

const EventControlSchema = new Schema<IEventControl>(
    {
        finalAnswerOpen: { type: Boolean, default: false },
        finalAnswerStartTime: { type: Date, default: null },
        finalAnswerDeadline: { type: Date, default: null },
        correctRealWorld: { type: String, default: "" },
        correctVillain: { type: String, default: "" },
        correctWeapon: { type: String, default: "" },
    },
    { timestamps: true }
);

const EventControl: Model<IEventControl> =
    mongoose.models.EventControl ||
    mongoose.model<IEventControl>("EventControl", EventControlSchema);

export default EventControl;
