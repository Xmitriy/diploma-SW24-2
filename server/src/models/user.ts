import mongoose, { Document, Schema, Model, ObjectId } from "mongoose";

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
}

export interface IUser extends Document {
  _id: ObjectId;
  username: string;
  email: string;
  stats?: Record<string, any>;
  gender: Gender;
  birthday: Date;
  height: number;
  weight: number;
  goal: string;
  activityLevel: string;
  mealPerDay: string;
  waterPerDay: string;
  workSchedule: string;
  healthCondition: string;
  password: string;
  role: Role;
  bio?: string;
  image?: string | null;
  posts?: ObjectId[];
  isEmailVerified: boolean;
  hasOnboarded: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  streak?: number;
  highestStreak?: number;
  totalCalories?: number;
  lastStreakUpdate?: Date;
}

// Define the schema
const userSchema: Schema<IUser> = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    stats: {
      type: Schema.Types.Mixed,
      required: false,
    },
    gender: {
      type: String,
      required: true,
    },
    birthday: {
      type: Date,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    goal: {
      type: String,
      required: true,
    },
    activityLevel: {
      type: String,
      required: true,
    },
    mealPerDay: {
      type: String,
      required: true,
    },
    waterPerDay: {
      type: String,
      required: true,
    },
    workSchedule: {
      type: String,
      required: true,
    },
    healthCondition: {
      type: String,
      required: true,
    },
    streak: {
      type: Number,
      required: false,
      default: 0,
    },
    highestStreak: {
      type: Number,
      required: false,
      default: 0,
    },
    totalCalories: {
      type: Number,
      required: false,
      default: 0,
    },
    lastStreakUpdate: {
      type: Date,
      required: false,
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
      required: true,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "Hello this is my Bio",
    },
    image: {
      type: String,
      default: null,
      required: false,
    },
    posts: {
      type: [Schema.Types.ObjectId],
      ref: "Blog",
      required: false,
      default: [],
    },
    isEmailVerified: { type: Boolean, default: false, required: false },
    hasOnboarded: { type: Boolean, default: false, required: false },
    emailVerificationToken: { type: String, required: false, default: null },
    emailVerificationTokenExpiry: {
      type: Date,
      required: false,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
).index({ email: 1 }, { unique: true });

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
