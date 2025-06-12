import { View, Text, Pressable } from "react-native";
import { formatDistanceToNow } from "date-fns";
import { Heart } from "lucide-react-native";
import { useBlogStore, Comment } from "@/stores/blogStore";
import { useState } from "react";
import { Avatar } from "@/components";
interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const { currentUser, likeComment } = useBlogStore();
  const [isLiked, setIsLiked] = useState(
    comment.likes?.includes(currentUser?._id ?? "")
  );

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  const toggleLike = () => {
    likeComment(comment.blogId, comment._id);
    if (isLiked) {
      setIsLiked(false);
    } else {
      setIsLiked(true);
    }
  };

  return (
    <View className="mb-4 p-2 border-b border-gray-200">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Avatar image={comment.author.image} size={40} />
          <View className="ml-2">
            <View className="flex-row items-center mb-1">
              <Text className="font-bold text-neutral-800 mr-2 dark:text-white">
                {comment.author.username}
              </Text>
            </View>
            <Text className="text-neutral-500 text-xs">{timeAgo}</Text>
          </View>
        </View>
        <View className="flex-row items-center mt-1 ml-1">
          <Pressable onPress={toggleLike}>
            <Heart
              size={14}
              color={isLiked ? "#FF7256" : "#9CA3AF"}
              fill={isLiked ? "#FF7256" : "transparent"}
            />
            <Text className="ml-1 text-xs text-neutral-500">
              {comment.likes?.length > 0 ? comment.likes?.length : ""}
            </Text>
          </Pressable>
        </View>
      </View>
      <View className="flex-1">
        <View className="rounded-lg p-3">
          <Text className="text-neutral-700 dark:text-neutral-100">
            {comment.content}
          </Text>
        </View>
      </View>
    </View>
  );
}
