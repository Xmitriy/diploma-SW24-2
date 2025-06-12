import { Document, Model, Schema, model } from "mongoose";

export type MessageRole = "system" | "user" | "model";

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  addMessage: (role: MessageRole, content: string) => Promise<IChat>;
}

export interface ChatModel extends Model<IChat> {
  findOrCreate: (userId: string) => Promise<IChat>;
}

const chatMessageSchema = new Schema<ChatMessage>(
  {
    role: {
      type: String,
      enum: ["system", "user", "model"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatSchema = new Schema<IChat>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [chatMessageSchema],
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ userId: 1, createdAt: -1 });

chatSchema.methods.addMessage = async function (
  this: IChat,
  role: MessageRole,
  content: string
): Promise<IChat> {
  this.messages.push({ role, content, timestamp: new Date() });
  this.updatedAt = new Date();
  return this.save();
};

chatSchema.statics.findOrCreate = async function (
  this: Model<IChat>,
  userId: string
): Promise<IChat> {
  let chat = await this.findOne({ userId });
  if (!chat) {
    chat = await this.create({
      userId,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
          timestamp: new Date(),
        },
      ],
    });
  }
  return chat;
};

const Chat = model<IChat, ChatModel>("ChatBotHistory", chatSchema);

export default Chat;
