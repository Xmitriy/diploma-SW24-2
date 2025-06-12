import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import Chat, { IChat } from "@/models/chatbotHistory";
import { config } from "dotenv";
import { Response } from "express";
config();

export class ChatbotService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private systemPrompt: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY as string;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    this.systemPrompt = `You are a knowledgeable assistant focused entirely on fitness and health. Your purpose is to provide helpful, accurate information specifically related to fitness, exercise, nutrition, and overall wellness.

Topics you are allowed to discuss include:
- Exercise routines and workouts
- Nutrition and dietary advice
- Physical health and wellness
- Sports training and performance
- Body composition and fitness goals

Important Guidelines:
1. If a question is asked that is not related to fitness or health, you must respond with the following message only:
   "I'm sorry, I can only provide information about fitness, exercise, nutrition, and health-related topics. Please ask me about fitness or health instead."

2. You must not:
   - Answer or explain questions unrelated to fitness or health
   - Offer alternative sources or suggestions
   - Engage in discussion about off-topic subjects

Restricted topics include:
- Politics, history, or current events
- Technology and science (unless directly related to fitness)
- Entertainment and media
- Personal matters not connected to fitness or health

Please remain focused on fitness and health topics..`;
  }

  async getConversationHistory(userId: string): Promise<IChat["messages"]> {
    try {
      const chat = await Chat.findOne({ userId });
      return chat ? chat.messages : [];
    } catch (error: any) {
      console.warn("Error getting conversation history:", error.message);
      return [];
    }
  }

  async startNewConversation(userId: string): Promise<IChat["messages"]> {
    try {
      const chat = await Chat.findOrCreate(userId);
      chat.messages[0] = {
        role: "system",
        content: this.systemPrompt,
        timestamp: new Date(),
      };
      await chat.save();
      return chat.messages;
    } catch (error: any) {
      console.warn("Error starting new conversation:", error.message);
      throw error;
    }
  }

  async sendMessageStream(
    userId: string,
    message: string,
    res: Response
  ): Promise<void> {
    try {
      let chat = await Chat.findOne({ userId });

      if (!chat) {
        chat = await Chat.create({
          userId,
          messages: [
            {
              role: "system",
              content: this.systemPrompt,
              timestamp: new Date(),
            },
          ],
        });
      }

      if (chat.messages.length === 0 || chat.messages[0].role !== "system") {
        chat.messages.unshift({
          role: "system",
          content: this.systemPrompt,
          timestamp: new Date(),
        });
        await chat.save();
      }

      await chat.addMessage("user", message);

      const chatSession = this.model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: this.systemPrompt }],
          },
          ...chat.messages.slice(1).map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.content }],
          })),
        ],
        generationConfig: {
          maxOutputTokens: 2048,
        },
      });

      const resultStream = await chatSession.sendMessageStream(message);

      let aiMessage = "";

      for await (const chunk of resultStream.stream) {
        const text = chunk.text();
        aiMessage += text;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }

      res.write("event: close\ndata: end\n\n");
      res.end();
      await chat.addMessage("model", aiMessage);
    } catch (error: any) {
      console.error("Error in chatbot:", error.message);
      res.write("event: error\ndata: end\n\n");
      res.end();
    }
  }

  async clearConversation(userId: string): Promise<IChat["messages"]> {
    try {
      await Chat.deleteOne({ userId });
      return await this.startNewConversation(userId);
    } catch (error: any) {
      console.warn("Error clearing conversation:", error.message);
      throw error;
    }
  }

  async getRecentConversations(userId: string, limit = 10): Promise<IChat[]> {
    try {
      return await Chat.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .select("messages updatedAt");
    } catch (error: any) {
      console.warn("Error getting recent conversations:", error.message);
      return [];
    }
  }
}

export const chatbotService = new ChatbotService();
