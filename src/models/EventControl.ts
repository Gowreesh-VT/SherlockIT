import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEventControl extends Document {
    finalAnswerOpen: boolean;
    finalAnswerStartTime: Date | null;
}

const EventControlSchema = new Schema<IEventControl>(
    {
        finalAnswerOpen: { type: Boolean, default: false },
        finalAnswerStartTime: { type: Date, default: null },
    },
    { timestamps: true }
);

const EventControl: Model<IEventControl> =
    mongoose.models.EventControl ||
    mongoose.model<IEventControl>("EventControl", EventControlSchema);

export default EventControl;
