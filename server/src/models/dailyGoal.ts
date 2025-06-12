import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDailyGoal extends Document {
  userId: Types.ObjectId;
  waterGoal: number;
  stepsGoal: number;
  caloriesGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  sleepGoal: number;
  rdcGoal: number;
  createdAt?: Date;
  updatedAt?: Date;
  needsUpdate(): boolean;
}

const dailyGoalSchema: Schema<IDailyGoal> = new Schema<IDailyGoal>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    waterGoal: {
      type: Number,
      required: true,
      default: 2000, // 2L default
    },
    stepsGoal: {
      type: Number,
      required: true,
      default: 10000, // 10k steps default
    },
    caloriesGoal: {
      type: Number,
      required: true,
      default: 2000,
    },
    proteinGoal: {
      type: Number,
      required: true,
      default: 50,
    },
    carbsGoal: {
      type: Number,
      required: true,
      default: 275,
    },
    fatGoal: {
      type: Number,
      required: true,
      default: 55,
    },
    sleepGoal: {
      type: Number,
      required: true,
      default: 8,
    },
    rdcGoal: {
      type: Number,
      required: true,
      default: 30,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

// Method to check if goals need updating (different day)
dailyGoalSchema.methods.needsUpdate = function (): boolean {
  const lastUpdate = new Date(this.updatedAt);
  const now = new Date();
  return (
    lastUpdate.getDate() !== now.getDate() ||
    lastUpdate.getMonth() !== now.getMonth() ||
    lastUpdate.getFullYear() !== now.getFullYear()
  );
};

const DailyGoal: Model<IDailyGoal> = mongoose.model<IDailyGoal>(
  "DailyGoal",
  dailyGoalSchema
);

export default DailyGoal;
