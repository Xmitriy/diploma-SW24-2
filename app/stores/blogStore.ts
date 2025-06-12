import { API_URL } from "@/utils/constants";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tokenCache } from "@/utils/cache";

interface Author {
  _id: string;
  username: string;
  image: string;
}

export interface Comment {
  _id: string;
  content: string;
  likes: string[];
  author: Author;
  blogId: string;
  edited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  _id: string;
  image?: string | "";
  title: string;
  content: string;
  description: string;
  author: Author;
  likes: string[];
  views: number;
  comments: string[];
  isBookmarked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BlogState {
  currentUser: User | null;
  posts: Post[];
  getPostById: (id: string) => Promise<Post | undefined>;
  addPost: (postData: {
    title: string;
    content: string;
    image: string | null;
  }) => Promise<Post>;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => Promise<void>;
  likeComment: (postId: string, commentId: string) => void;
  toggleBookmark: (postId: string) => void;
  setUser: (user: User) => void;
  loadPosts: () => Promise<void>;
  getComments: (postId: string) => Promise<Comment[]>;
  loadingPosts: boolean;
  sendingPost: boolean;
  loadingComments: boolean;
}

export const useBlogStore = create<BlogState>((set, get) => {
  let likeDebounceTimer: ReturnType<typeof setTimeout>;
  let bookmarkDebounceTimer: ReturnType<typeof setTimeout>;
  let bookmarkedPostsArray: string[] = [];

  const init = async () => {
    try {
      const bookmarkedPosts = await AsyncStorage.getItem("bookmarkedPosts");
      bookmarkedPostsArray = bookmarkedPosts ? JSON.parse(bookmarkedPosts) : [];
    } catch (error) {
      console.error("Error loading bookmarked posts:", error);
      bookmarkedPostsArray = [];
    }
  };
  init();

  const sendLikeToServer = async (postId: string) => {
    try {
      const accessToken = await tokenCache?.getToken("accessToken");
      if (!accessToken) return;

      const response = await fetch(`${API_URL}/post/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to update like status:", await response.json());
        return;
      }
    } catch (error) {
      console.error("Error in sendLikeToServer:", error);
    }
  };

  const sendBookmarkToServer = async (postId: string) => {
    // not sending to server i dont think its needed lmao
    try {
      const bookmarkedPosts = await AsyncStorage.getItem("bookmarkedPosts");
      bookmarkedPostsArray = bookmarkedPosts ? JSON.parse(bookmarkedPosts) : [];

      if (bookmarkedPostsArray.includes(postId)) {
        bookmarkedPostsArray = bookmarkedPostsArray.filter(
          (id: string) => id !== postId
        );
      } else {
        bookmarkedPostsArray.push(postId);
      }

      await AsyncStorage.setItem(
        "bookmarkedPosts",
        JSON.stringify(bookmarkedPostsArray)
      );

      console.log("bookmarkedPostsArray", bookmarkedPostsArray);

      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId
            ? { ...post, isBookmarked: !post.isBookmarked }
            : post
        ),
      }));
    } catch (error) {
      console.error("Error in sendBookmarkToServer:", error);
    }
  };

  const sendCommentLikeToServer = async (postId: string, commentId: string) => {
    try {
      const accessToken = await tokenCache?.getToken("accessToken");
      if (!accessToken) return;

      const response = await fetch(
        `${API_URL}/post/${postId}/comment/${commentId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to update comment like status:",
          await response.json()
        );
        return;
      }
    } catch (error) {
      console.log("Error in sendCommentLikeToServer:", error);
    }
  };

  return {
    loadingPosts: false,
    sendingPost: false,
    loadingComments: false,
    currentUser: null,
    setUser: (user: User) => set({ currentUser: user }),

    posts: [],

    loadPosts: async () => {
      try {
        set({ loadingPosts: true });
        const response = await fetch(`${API_URL}/post`);
        const data = await response.json();
        set({ posts: data.blogs });
      } catch (e) {
        console.log(e);
      } finally {
        set({ loadingPosts: false });
      }
    },

    getPostById: async (id) => {
      let post = get().posts.find((post) => post._id === id);
      if (!post) {
        const response = await fetch(`${API_URL}/post/${id}`);
        const data = await response.json();
        post = data.blog;
      }
      return post;
    },

    addPost: async (postData) => {
      try {
        set({ sendingPost: true });
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (!accessToken) return null;

        const formData = new FormData();
        formData.append("title", postData.title);
        formData.append("content", postData.content);

        if (postData.image) {
          const filename = postData.image.split("/").pop();
          const match = /\.(\w+)$/.exec(filename ?? "");
          const type = match ? `image/${match[1]}` : `image`;
          formData.append("image", {
            uri: postData.image,
            name: filename,
            type,
          } as any);
        }

        const response = await fetch(`${API_URL}/post`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          console.log("add post error response", await response.json());
          return null;
          // throw new Error(`Failed to add post: ${response.statusText}`);
        }

        const newPost = await response.json();
        set((state) => ({
          posts: [newPost.data, ...state.posts],
        }));
        console.log("newPost added", newPost);
        return newPost;
      } catch (error) {
        console.error("Error in addPost:", error);
        throw error;
      } finally {
        set({ sendingPost: false });
      }
    },

    // like post
    toggleLike: (postId: string) => {
      clearTimeout(likeDebounceTimer);
      likeDebounceTimer = setTimeout(() => {
        sendLikeToServer(postId);
      }, 500);
      set((state) => {
        const updatedPosts = state.posts.map((post) => {
          if (post._id === postId) {
            const userId = get().currentUser?._id;
            if (!userId) return post;
            const isLiked = post.likes?.includes(userId);
            return {
              ...post,
              likes: isLiked
                ? post.likes?.filter((id) => id !== userId)
                : [...(post.likes || []), userId],
            };
          }
          return post;
        });
        return { posts: updatedPosts };
      });
    },

    // like comment
    likeComment: (postId: string, commentId: string) => {
      clearTimeout(likeDebounceTimer);
      likeDebounceTimer = setTimeout(() => {
        sendCommentLikeToServer(postId, commentId);
      }, 500);
    },

    addComment: async (postId, content) => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (!accessToken) return;

        const response = await fetch(`${API_URL}/post/${postId}/comment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ content, postId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to add comment: ${response.statusText}`);
        }

        const newComment = await response.json();
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === postId
              ? { ...post, comments: [...post.comments, newComment] }
              : post
          ),
        }));
      } catch (error) {
        console.error("Error in addComment:", error);
        throw error;
      }
    },

    toggleBookmark: (postId) => {
      clearTimeout(bookmarkDebounceTimer);
      bookmarkDebounceTimer = setTimeout(() => {
        sendBookmarkToServer(postId);
      }, 500);
    },

    getComments: async (postId: string) => {
      try {
        set({ loadingComments: true });
        const response = await fetch(`${API_URL}/post/${postId}/comments`);
        const data = await response.json();
        set({ loadingComments: false });
        return data as Comment[];
      } catch (error) {
        console.error("Error in getComments:", error);
        return [] as Comment[];
      } finally {
        set({ loadingComments: false });
      }
    },
  };
});
