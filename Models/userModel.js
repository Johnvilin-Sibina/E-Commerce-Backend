import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture:{
      type: String,
      default: "https://www.shutterstock.com/image-vector/user-icon-vector-trendy-flat-600nw-1720665448.jpg"
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User",userSchema);
export default User