import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoDB_URL = process.env.MONGODB_URL;

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(mongoDB_URL);
    return connection;
  } catch (error) {
    throw new Error("MongoDB Connection Error.");
  }
};

export default connectDB;
