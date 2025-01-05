import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim:true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim:true
    },
    password: {
      type: String,
      required: true,
      trim:true
    },
    address: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/dhke5mt23/image/upload/v1735907122/avatar_vdcl9x.jpg",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
