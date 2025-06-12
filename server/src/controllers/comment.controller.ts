import Comment, { IComment } from "@/models/comment";
import Blog from "@/models/post";
import User from "@/models/user";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "./token";

class CommentController {
  public static async createComment(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const { content, postId } = req.body;
      if (!content?.trim() || !postId) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      if (!req.user || !req.user.id) {
        return res
          .status(401)
          .json({ error: "You must be logged in to comment" });
      }
      const user = await User.exists({ _id: req.user.id }).exec();
      if (!user) {
        return res.status(404).json({ error: "User account not found" });
      }
      const blogExists = await Blog.exists({ _id: postId });
      if (!blogExists) {
        return res.status(404).json({ error: "Blog not found" });
      }
      const comment = await Comment.create({
        content,
        postId,
        author: user._id,
        blogId: postId,
      });
      await Blog.findByIdAndUpdate(
        postId,
        { $push: { comments: comment._id } },
        { new: true }
      );
      return res.status(201).json(comment);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  public static async getComments(req: Request, res: Response): Promise<any> {
    try {
      const blogId = req.params.id;
      if (!blogId) {
        return res.status(400).json({ error: "Specify blog id" });
      }
      const comments = (await Comment.find({ blogId: blogId })
        .populate({
          path: "author",
          select: "username image",
          options: {
            lean: true,
            limit: 10,
          },
        })
        .sort({ createdAt: -1 })
        .lean()) as unknown as IComment[] | null;
      if (!comments) {
        return res.status(404).json([]);
      }
      return res.status(200).json(comments);
    } catch (err) {
      console.log("get comments", err);
      return res.status(500).json({ error: "something went wrong" });
    }
  }

  public static async likeComment(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const { commentId, postId } = req.params;
      if (!commentId || !postId) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const post = await Blog.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      const user = await User.exists({ _id: req.user.id });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const isLiked = comment.likes.includes(user._id);
      if (isLiked) {
        comment.likes = comment.likes.filter((id) => id !== user._id);
      } else {
        comment.likes.push(user._id);
      }
      await comment.save();
      return res.status(200).json(comment);
    } catch (err) {
      console.log("like comment", err);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }
}

export default CommentController;

export interface ICommentWithAuthor {
  _id: string;
  content: string;
  edited: boolean;
  blogId: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    firstName: string;
    lastName: string;
    profilePicture: string;
  };
}
