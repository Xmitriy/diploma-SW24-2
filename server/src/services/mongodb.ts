import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectToMongoDB = async () => {
  const mongoURI = process.env.MONGO_URI as string;

  try {
    await connect(mongoURI);
    console.log(`✅ Connected to MongoDB`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectToMongoDB;
