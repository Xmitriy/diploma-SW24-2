import { create } from "zustand";
import EventSource from "react-native-sse";
import { tokenCache } from "@/utils/cache";

interface ChatState {
  messages: Message[];
  isSending: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  isLoading: boolean;
  hasShownAuthError: boolean;
  sendMessage: (
    message: string,
    onChunk: (chunk: string) => void
  ) => Promise<string | undefined>;
  clearChat: () => Promise<void>;
  getConversationHistory: () => Promise<void>;
  clearError: () => void;
}

const api = process.env.EXPO_PUBLIC_API_URL as string;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoadingHistory: false,
  isSending: false,
  error: null,
  isLoading: false,
  hasShownAuthError: false,
  clearError: () => set({ error: null, hasShownAuthError: false }),
  sendMessage: async (message: string, onChunk: (chunk: string) => void) => {
    set({ isSending: true, error: null });
    try {
      const accessToken = await tokenCache?.getToken("accessToken");
      if (!accessToken) {
        if (!get().hasShownAuthError) {
          set({
            error: "Authentication token not found. Please log in.",
            hasShownAuthError: true,
          });
        }
        return;
      }
      return new Promise((resolve, reject) => {
        const es = new EventSource(`${api}/chatbot/message`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        });

        let result = "";

        es.addEventListener("message", (event) => {
          if (!event.data) return;
          if (event.data === "end") {
            es.close();
            return resolve(result);
          }
          try {
            const data = JSON.parse(event.data);
            if (data.text) {
              result += data.text;
              onChunk(data.text);
            }
          } catch (err) {
            console.warn("Failed to parse SSE chunk:", event.data, err);
          }
        });
        es.addEventListener("error", (err) => {
          console.error("Connection error:", err);
          es.close();
          reject(err);
        });

        es.addEventListener("close", () => {
          es.close();
          resolve(result);
        });

        return () => {
          es.removeAllEventListeners();
          es.close();
        };
      });
    } catch (error) {
      console.error("Error sending message:", error);
      set({ error: "Failed to send message" });
    } finally {
      set({ isSending: false });
    }
  },

  clearChat: async () => {
    try {
      set({ isLoading: true, error: null });
      const accessToken = await tokenCache?.getToken("accessToken");
      const response = await fetch(`${api}/chatbot/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to clear chat");
      }

      set({ messages: [] });
    } catch (error) {
      console.error("Error clearing chat:", error);
      set({ error: "Failed to clear chat" });
    } finally {
      set({ isLoading: false });
    }
  },

  getConversationHistory: async () => {
    set({ isLoadingHistory: true, error: null });
    try {
      const accessToken = await tokenCache?.getToken("accessToken");
      if (!accessToken) {
        if (!get().hasShownAuthError) {
          set({
            error: "Authentication token not found. Please log in.",
            isLoadingHistory: false,
            hasShownAuthError: true,
          });
          // Add a default initial message if no history and no token
          if (get().messages.length === 0) {
            set({
              messages: [
                {
                  id: "init-no-auth",
                  content:
                    "Hello! I'm your AI assistant. Sign in to see your history.",
                  role: "model",
                  timestamp: new Date(),
                },
              ],
            });
          }
        }
        return;
      }

      const response = await fetch(`${api}/chatbot/history`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        let errorBody = `Status: ${response.status}`;
        try {
          const data = await response.json();
          errorBody = JSON.stringify(data.detail || data);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          try {
            errorBody = (await response.text()) || errorBody;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e2) {}
        }
        throw new Error(`Failed to get conversation history: ${errorBody}`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.history)) {
        const historyMessages = (data.history as any[])
          .filter((msg) => msg.role !== "system") // Filter system messages here
          .map(
            (msg): Message => ({
              id: msg.id || `hist-${Math.random()}`, // Ensure ID
              content: msg.content || msg.text || "", // Adapt to API response
              role: msg.role || (msg.sender === "user" ? "user" : "model"), // Adapt
              timestamp: new Date(msg.timestamp || Date.now()),
            })
          );
        set({ messages: historyMessages, isLoadingHistory: false });
        if (historyMessages.length === 0) {
          set({
            messages: [
              {
                id: "init-empty-hist",
                content: "Hello! I'm your AI assistant. Start chatting!",
                role: "model",
                timestamp: new Date(),
              },
            ],
          });
        }
      } else {
        set({ messages: [], isLoadingHistory: false }); // Clear messages if malformed
        set({
          messages: [
            {
              id: "init-malformed-hist",
              content:
                "Hello! I'm your AI assistant. There was an issue loading history.",
              role: "model",
              timestamp: new Date(),
            },
          ],
        });
        throw new Error("Received malformed history data from server.");
      }
    } catch (err: any) {
      set({
        error: err.message || "Failed to load history.",
        isLoadingHistory: false,
      });
      if (get().messages.length === 0) {
        set({
          messages: [
            {
              id: "init-load-err",
              content: `Hello! I'm your AI assistant. Error loading history: ${err.message}`,
              role: "model",
              timestamp: new Date(),
            },
          ],
        });
      }
    }
  },
}));
