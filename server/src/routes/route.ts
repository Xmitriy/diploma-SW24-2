import express from "express";
import authRouter from "@/routes/authRoutes";
import chatbotRouter from "@/routes/chatbotRoutes";
import postRouter from "@/routes/postRoutes";
import completedDayRouter from "@/routes/completedDayRoutes";

const app = express.Router();

app.use("/auth", authRouter);
app.use("/chatbot", chatbotRouter);
app.use("/post", postRouter);
app.use("/streak", completedDayRouter);

export default app;
