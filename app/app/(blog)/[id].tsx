import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Post, useBlogStore, Comment } from "@/stores/blogStore";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
} from "lucide-react-native";
import CommentItem from "@/components/CommentItem";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Avatar, ThemeText } from "@/components";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const {
    getPostById,
    currentUser,
    toggleLike,
    addComment,
    toggleBookmark,
    getComments,
  } = useBlogStore();
  const [post, setPost] = useState<Post | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  // user comment that is being typed
  const [comment, setComment] = useState("");
  // comments of the post
  const [comments, setComments] = useState<Comment[]>([]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    (async () => {
      const fetchedPost = await getPostById(id as string);
      setPost(fetchedPost as Post);
      setLikeCount(fetchedPost?.likes.length || 0);
    })();
    (async () => {
      const fetchedComments = await getComments(id as string);
      setComments(fetchedComments as Comment[]);
    })();
  }, [id, getPostById, getComments]);

  // im fetchin comments
  useEffect(() => {
    if (post) {
      getComments(post._id);
    }
  }, [post, getComments]);

  useEffect(() => {
    if (post) {
      setIsLiked(post.likes?.includes(currentUser?._id ?? ""));
    }
  }, [post, currentUser]);

  useEffect(() => {
    if (post) {
      setIsBookmarked(post.isBookmarked ?? false);
    }
  }, [post]);

  if (!post || !currentUser) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Post not found</Text>
      </View>
    );
  }

  const handleLike = () => {
    toggleLike(post._id);
    setIsLiked(!isLiked);
    setLikeCount(Math.max(0, likeCount + (isLiked ? -1 : 1)));
  };

  const handleBookmark = () => {
    toggleBookmark(post._id);
    setIsBookmarked(!isBookmarked);
  };

  const handleComment = () => {
    if (!comment.trim()) return;

    addComment(post._id, comment);
    setComment("");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white p-6 dark:bg-gray-900"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      style={{ paddingTop: insets.top }}
    >
      <View className="p-4 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-4 dark:text-white"
        >
          <ArrowLeft size={24} color="#1F2937" className="dark:bg-white" />
        </Pressable>
        <Text className="text-xl font-bold text-neutral-800 dark:text-white">
          Post
        </Text>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4">
          <View className="border border-gray-300 rounded-3xl p-7 bg-white dark:bg-gray-800">
            <View className="flex-row items-center mb-3 gap-3">
              <Avatar image={post.author.image} size={40} />
              <View>
                <Text className="font-bold text-neutral-800 dark:text-white">
                  {post.author.username}
                </Text>
                <Text className="text-neutral-500 text-xs">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </Text>
              </View>
            </View>

            <Text className="text-xl font-bold text-neutral-800 mb-2 dark:text-white">
              {post.title}
            </Text>
            <Text className="text-base text-neutral-700 mb-4 leading-6 dark:text-neutral-100">
              {post.content}
            </Text>

            {post.image && (
              <Image
                source={{ uri: post.image }}
                className="w-full aspect-video rounded-lg mb-4"
                resizeMode="cover"
              />
            )}

            <View className="flex-row justify-between items-center py-3">
              <Pressable className="flex-row items-center" onPress={handleLike}>
                <Heart
                  size={20}
                  color={isLiked ? "#FF7256" : "#6B7280"}
                  fill={isLiked ? "#FF7256" : "transparent"}
                />
                <Text className="ml-1 text-neutral-600">{likeCount}</Text>
              </Pressable>

              <View className="flex-row items-center">
                <MessageCircle size={20} color="#6B7280" />
                <Text className="ml-1 text-neutral-600">
                  {post.comments?.length || 0}
                </Text>
              </View>

              <Pressable className="flex-row items-center">
                <Share size={20} color="#6B7280" />
              </Pressable>

              <Pressable onPress={handleBookmark}>
                <Bookmark
                  size={20}
                  color={isBookmarked ? "#3B82F6" : "#6B7280"}
                  fill={isBookmarked ? "#3B82F6" : "transparent"}
                />
              </Pressable>
            </View>
          </View>

          <Text className="font-bold text-neutral-800 mt-4 mb-2 dark:text-white">
            Comments ({post.comments?.length || 0})
          </Text>

          {comments.map((comment) => (
            <Animated.View
              key={comment._id}
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(300)}
            >
              <CommentItem comment={comment} />
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <View className="p-4 bottom-7 flex-row bg-white dark:bg-gray-900">
        <Avatar image={currentUser.image} size={32} />
        <TextInput
          className="flex-1 bg-neutral-100 rounded-full px-4 py-2 mr-2 ml-3 text-neutral-700"
          placeholder="Add a comment..."
          placeholderTextColor="#9CA3AF"
          value={comment}
          onChangeText={setComment}
        />
        <Pressable
          className={`justify-center px-4 ${
            !comment.trim() ? "opacity-50" : ""
          }`}
          onPress={handleComment}
          disabled={!comment.trim()}
        >
          <ThemeText className="text-primary-500 font-bold ">Post</ThemeText>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
