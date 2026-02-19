import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWorld extends Document {
    title: string;
    story: string;
    question: string;
    answer: string;
    order: number;
    isLocked: boolean;
}

const WorldSchema = new Schema<IWorld>(
    {
        title: { type: String, required: true },
        story: { type: String, required: true },
        question: { type: String, required: true },
        answer: { type: String, required: true },
        order: { type: Number, required: true, unique: true },
        isLocked: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const World: Model<IWorld> =
    mongoose.models.World || mongoose.model<IWorld>("World", WorldSchema);

export default World;
