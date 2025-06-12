import express from "express";
import ChatbotController from "@/controllers/chatbot";
import { authenticate } from "@/controllers/token";

const app = express.Router();

app.post("/message", authenticate, ChatbotController.sendMessage);
app.get("/history", authenticate, ChatbotController.getConversationHistory);
app.get("/recent", authenticate, ChatbotController.getRecentConversations);
app.delete("/clear", authenticate, ChatbotController.clearConversation);

export default app;
