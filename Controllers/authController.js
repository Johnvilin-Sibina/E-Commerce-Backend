import User from "../Models/userModel.js";
import { errorHandler } from "../Utils/Error.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendLink } from "../Services/NodeMailer.js";

dotenv.config();

export const registerUser = async (req, res, next) => {
  const { username, email, password, address, phoneNumber } = req.body;
  if (
    !username ||
    !email ||
    !password ||
    !address ||
    !phoneNumber ||
    username === "" ||
    email === "" ||
    password === "" ||
    address === "" ||
    phoneNumber === ""
  ) {
    return next(errorHandler(400, "All the Fields are Required"));
  }
  const hashedPassword = bcryptjs.hashSync(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    address: address,
    phoneNumber: phoneNumber,
  });
  try {
    await newUser.save();
    res
      .status(200)
      .json({ message: "User Registered Successfully", result: newUser });
  } catch (error) {
    return next(errorHandler(error));
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password || email === "" || password === "") {
    return next(errorHandler(400, "All the Fields are Required"));
  }
  try {
    const userDetail = await User.findOne({ email });
    const userPassword = bcryptjs.compareSync(password, userDetail.password);
    if (!userDetail || !userPassword) {
      return next(errorHandler(400, "Invalid Credentials"));
    }
    const token = jwt.sign(
      { id: userDetail._id, isAdmin: userDetail.isAdmin },
      process.env.JWT_SECRET_KEY
    );
    const { password: passkey, ...rest } = userDetail._doc;
    res
      .status(200)
      .json({ message: "User Logged In Successfully", rest, token });
  } catch (error) {
    return next(errorHandler(error));
  }
};

export const google = async (req, res, next) => {
  const { email, name, profilePic } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET_KEY
      );
      const { password: passkey, ...rest } = user._doc;
      res
        .status(200)
        .json({ message: "User Logged In Successfully", rest, token });
    } else {
      const generatePassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatePassword, 10);
      const newUser = new User({
        username:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: profilePic,
      });

      await newUser.save();

      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET_KEY
      );
      const { password: passkey, ...rest } = newUser._doc;
      res
        .status(200)
        .json({ message: "User Logged In Successfully", rest, token });
    }
  } catch (error) {
    return next(errorHandler(error));
  }
};

//Function to send email to reset password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(401, "User not found"));
    }
    const userId = user._id;
    const token = jwt.sign({ _id: userId }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });
    await sendLink(email, token, userId);
    res.status(200).json({ message: "Mail Sent Successfully" });
  } catch (error) {
    return next(errorHandler(error));
  }
};

//Function to reset password
export const resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return next(errorHandler(401, "Password does not match"));
    }
    const user = await User.findById(id);
    if (!user) {
      return next(errorHandler(401, "User not found"));
    }
    const hashPassword = await bcryptjs.hashSync(newPassword, 10);
    user.password = hashPassword;
    await user.save();
    res.status(200).json({ message: "Password Reset Successfully" });
  } catch (error) {
    return next(errorHandler(error));
  }
};
