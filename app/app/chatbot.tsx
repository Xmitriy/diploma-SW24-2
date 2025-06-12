import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, use } from "react";
import { useAppTheme } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useChatStore } from "@/stores/chatStore";
import MessageBubble from "@/components/chat/messageBubble";
import Header from "@/components/chat/Header";
import { StatusBar } from "expo-status-bar";
import ListFooterElement from "@/components/chat/ListFooterElement";
import { AuthContext } from "@/context/auth";
// import CameraTracking from "@/components/cameraTracking";

const LoadingIndicator = () => {
  const { theme } = useAppTheme();
  return (
    <View className="flex-row items-center my-4 justify-center gap-2 px-4">
      <ActivityIndicator
        size="small"
        color={theme === "dark" ? "#9CA3AF" : "#6B7280"}
      />
      <Text className="text-sm text-gray-500 dark:text-gray-400">
        Loading history...
      </Text>
    </View>
  );
};

export default function ChatScreen() {
  const { user } = use(AuthContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const {
    sendMessage,
    clearChat,
    isSending,
    isLoadingHistory,
    error,
    messages: storeMessages,
    clearError,
  } = useChatStore();

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  useEffect(() => {
    useChatStore.getState().getConversationHistory();
  }, []);

  // GET HISTORY
  useEffect(() => {
    if (storeMessages?.length > 0) {
      const convertedMessages = storeMessages?.filter(
        (msg) => msg.role !== "system"
      );
      setMessages(convertedMessages.reverse() as Message[]);
    } else {
      setMessages([
        {
          id: "init-1",
          content: "Hello! I'm your AI assistant.",
          role: "model",
          timestamp: new Date(),
        },
      ]);
    }
  }, [storeMessages]);

  // INITIAL MESSAGE
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "init-1",
          content: "Hello! I'm your AI assistant.",
          role: "model",
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages]);

  // SEND MESSAGE
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText.trim(),
      role: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [userMessage, ...prev]);
    setInputText("");

    const botMessageId = (Date.now() + 1).toString();
    const newBotMessagePlaceholder: Message = {
      id: botMessageId,
      content: "",
      role: "model",
      timestamp: new Date(),
    };
    setMessages((prev) => [newBotMessagePlaceholder, ...prev]);
    setStreamingMessageId(botMessageId);

    try {
      await sendMessage(userMessage.content, (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        );
      });
    } catch (err) {
      console.error("AI stream error in handleSend:", err);
      setMessages((prevMsgs) =>
        prevMsgs.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, content: "[Error connecting to AI. Please try again.]" }
            : msg
        )
      );
    } finally {
      setStreamingMessageId(null);
    }
  };
  // ERROR HANDLING
  useEffect(() => {
    if (error && messages.length > 0) {
      const currentStreamingMessage = messages.find(
        (m) => m.id === streamingMessageId
      );
      if (currentStreamingMessage && currentStreamingMessage.role === "model") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === streamingMessageId ? { ...msg, content: error } : msg
          )
        );
      } else if (
        error &&
        !streamingMessageId &&
        !messages.some((m) => m.id === "error-1")
      ) {
        setMessages((prev) => [
          {
            id: "error-1",
            content: error,
            role: "model",
            timestamp: new Date(),
          },
          ...prev,
        ]);
      }
    }
  }, [error, messages, streamingMessageId]);

  // CLEAR CHAT
  const handleClearChat = () => {
    clearChat();
  };

  const inputDisabled =
    !inputText.trim() || isSending || isLoadingHistory || !user;

  return (
    <SafeAreaView className="dark:bg-[#1A202C] bg-white flex-1" edges={["top"]}>
      {/* <CameraTracking /> */}
      <StatusBar style={theme === "dark" ? "light" : "dark"} hidden={false} />
      <Header title="Chatbot" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="dark:bg-gray-900 bg-white flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 35 : 0}
      >
        <FlatList
          inverted={true}
          data={messages}
          ListFooterComponent={<ListFooterElement />}
          renderItem={({ item }) => (
            <MessageBubble
              key={item.id}
              message={item}
              isCurrentlyStreaming={item.id === streamingMessageId}
              setCurrentStreamingMessageId={setStreamingMessageId}
              isSending={isSending && item.id === streamingMessageId}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500 dark:text-gray-400">
                No messages yet
              </Text>
            </View>
          }
          keyExtractor={(item) => item.id}
          className="flex-1 px-4 pb-12"
          contentContainerClassName="pb-4"
          ListHeaderComponent={
            isLoadingHistory && messages.length <= 1 ? (
              <LoadingIndicator />
            ) : null
          }
        />

        {/* meow input */}
        <View
          className="flex-row items-center px-4 py-2 border-t border-gray-200 dark:border-gray-800"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          <Pressable
            onPress={handleClearChat}
            disabled={isSending || isLoadingHistory}
            className="p-2 mr-2"
          >
            <Ionicons
              name="trash-outline"
              size={24}
              color={
                isSending || isLoadingHistory
                  ? theme === "dark"
                    ? "#4B5563"
                    : "#D1D5DB"
                  : theme === "dark"
                  ? "#9CA3AF"
                  : "#6B7280"
              }
            />
          </Pressable>

          <TextInput
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-5 py-3 mr-2 text-gray-900 dark:text-gray-100 text-base"
            placeholder="Type a message..."
            placeholderTextColor={theme === "dark" ? "#9CA3AF" : "#6B7280"}
            value={inputText}
            onChangeText={setInputText}
            multiline
            submitBehavior="blurAndSubmit"
            returnKeyType="send"
            onSubmitEditing={handleSend}
            editable={!inputDisabled}
            style={{ textAlignVertical: "top" }}
          />
          <Pressable
            onPress={handleSend}
            disabled={inputDisabled}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              inputDisabled ? "bg-gray-300 dark:bg-gray-700" : "bg-blue-500"
            }`}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={
                  inputDisabled
                    ? "white"
                    : theme === "dark"
                    ? "#4B5563"
                    : "#9CA3AF"
                }
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
