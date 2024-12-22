import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoDB_URL = process.env.MONGODB_URL;

const connectDB = async (req,res) => {
  try {
    const connection = await mongoose.connect(process.env.mongoDB_URL);
    console.log("MonogoDB Connected Successfully.");
    return connection;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "MongoDB Connection Error." });
  }
};

export default connectDB;