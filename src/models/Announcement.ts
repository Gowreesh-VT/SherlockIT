import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnnouncement extends Document {
    message: string;
    createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
    {
        message: { type: String, required: true },
    },
    { timestamps: true }
);

const Announcement: Model<IAnnouncement> =
    mongoose.models.Announcement ||
    mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);

export default Announcement;
