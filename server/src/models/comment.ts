import { Schema, model, ObjectId } from "mongoose";

export interface IComment extends Document {
  _id: ObjectId;
  content: string;
  likes: ObjectId[];
  author: ObjectId;
  blogId: ObjectId;
  edited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
    },
    likes: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
      required: false,
    },
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    edited: {
      type: Boolean,
      required: false,
      default: false,
    },
    createdAt: {
      type: Date,
      required: false,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = model<IComment>("Comment", commentSchema);

export default Comment;
