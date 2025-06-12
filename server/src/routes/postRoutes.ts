import { Router } from "express";
import Posts from "@/controllers/post.controller";
import { authenticate } from "@/controllers/token";
import CommentController from "@/controllers/comment.controller";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// the route is /post

// posts
router.get("/", Posts.getPosts);
router.get("/:id", Posts.getPostById);
router.post("/", authenticate, upload.single("image"), Posts.createPost);
router.get("/user/:id", authenticate, Posts.getUserPosts);
router.post("/:id/like", authenticate, Posts.likePost);

// comments
router.post("/:id/comment", authenticate, CommentController.createComment);
router.get("/:id/comments", CommentController.getComments);
router.post(
  "/:postId/comment/:commentId/like",
  authenticate,
  CommentController.likeComment
);

export default router;
