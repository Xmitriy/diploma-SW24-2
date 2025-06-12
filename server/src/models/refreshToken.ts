import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IRefreshToken extends Document {
  tokenHash: string;
  expiresAt: Date;
  userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const refreshTokenSchema: Schema<IRefreshToken> = new Schema<IRefreshToken>(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const RefreshToken: Model<IRefreshToken> = mongoose.model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);

export default RefreshToken;
