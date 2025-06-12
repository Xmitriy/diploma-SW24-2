import { model, Schema, ObjectId } from "mongoose";

export interface IPost {
  _id: ObjectId;
  image?: string;
  title: string;
  content: string;
  description: string;
  author: ObjectId;
  likes: ObjectId[];
  views: number;
  comments: ObjectId[];
  createdAt: Date;
  updatedAt?: Date;
}

const postSchema = new Schema(
  {
    image: {
      type: String,
      default: null,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: false,
      default: [],
    },
    views: {
      type: Number,
      required: false,
      default: 0,
    },
    comments: {
      type: [Schema.Types.ObjectId],
      ref: "Comment",
      required: false,
      default: [],
    },
    createdAt: {
      type: Date,
      required: false,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    indexes: [{ fields: ["author"] }],
  }
);

const Post = model<IPost>("Post", postSchema);

export default Post;
