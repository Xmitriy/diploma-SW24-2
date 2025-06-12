import Post from "@/models/post";
import { AuthenticatedRequest } from "./token";
import { Request, Response } from "express";
import User from "@/models/user";
import { uploadBlogImage } from "@/helpers/uploadImage";

class PostController {
  public static async createPost(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const { title, content } = req.body;
      const image = req.file;
      if (!title || !content) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const imageUrl = await uploadBlogImage(image);
      const blog = await Post.create({
        title,
        content,
        image: imageUrl,
        author: req.user.id,
      });
      await User.findByIdAndUpdate(req.user.id, {
        $push: { posts: blog._id },
      });
      return res
        .status(201)
        .json({ message: "Blogs added successfully", data: blog });
    } catch (err) {
      console.log("add Blogs", err);
      return res.status(500).json({ error: "something went wrong" });
    }
  }

  public static async getPosts(_req: Request, res: Response): Promise<any> {
    try {
      const blogs = await Post.find().populate("author", "username image");
      return res.status(200).json({ blogs });
    } catch (err) {
      console.log("get Blogs", err);
      return res.status(500).json({ error: "something went wrong" });
    }
  }

  public static async getUserPosts(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const posts = await Post.find({ author: userId });
      return res.status(200).json({ posts });
    } catch (err) {
      console.log("get User Posts", err);
      return res.status(500).json({ error: "something went wrong" });
    }
  }

  public static async getPostById(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: "Id is required" });
      }
      if (id) {
        const blog = await Post.findByIdAndUpdate(
          id,
          { $inc: { views: 1 } },
          {
            new: true,
          }
        ).populate("author", "username image");
        if (!blog) {
          return res.status(404).json({ error: "Post not found" });
        }

        return res.status(200).json({ blog });
      }
    } catch (err) {
      console.log("get Post By Id", err);
      return res.status(500).json({ error: "something went wrong" });
    }
  }

  public static async likePost(req: Request, res: Response): Promise<any> {
    try {
      const postId = req.params.id;
      const userId = req.user?.id;
      if (!postId || !userId) {
        return res
          .status(400)
          .json({ error: "Post ID and User ID are required" });
      }
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      const isLiked = post.likes.includes(userId);
      if (isLiked) {
        post.likes = post.likes.filter((id) => id !== userId);
      } else {
        post.likes.push(userId);
      }
      await post.save();
      console.log("post liked");
      return res.status(200).json({ message: "Post liked successfully" });
    } catch (err) {
      console.log("like Post", err);
      return res.status(500).json({ error: "something went wrong" });
    }
  }
}

export default PostController;
