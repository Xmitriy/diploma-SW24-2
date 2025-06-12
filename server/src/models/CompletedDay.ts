import mongoose, { Document, Schema } from "mongoose";

export interface ICompletedDay extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  date: Date;
  createdAt: Date;
}

const CompletedDaySchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

CompletedDaySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<ICompletedDay>(
  "CompletedDay",
  CompletedDaySchema
);
