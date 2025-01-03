import User from "../Models/userModel.js";
import { errorHandler } from "../Utils/Error.js";
import bcryptjs from "bcryptjs";

export const updateUser = async (req, res, next) => {
    const {id} = req.params
  if (req.user.id != id ) {
    return next(errorHandler(401, "Unauthorized access to update the user"));
  }
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, "Password must be atleast 6 characters"));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
    if (req.body.username.length < 8 || req.body.username.length > 16) {
      return next(
        errorHandler(400, "Username must be between 8 and 16 characters")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username must not contain spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, "Username must be lowercase"));
    }
    if (!req.body.username.match(/^[A-Za-z0-9 ]+$/)) {
      return next(
        errorHandler(400, "Usename can only contain alphabet and numbers")
      );
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          profilePicture: req.body.profilePicture,
        },
      },
      {
        new: true,
      }
    );
    const { password, ...rest } = updatedUser._doc;
    res
      .status(200)
      .json({ message: "User Profile Updated Successfully", rest });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async(req,res,next)=>{
  if(req.user.id != req.params.id){
    return next(errorHandler(401, 'You are not allowed to delete this account.'))
  }
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({message:"User account deleted successfully."})
  } catch (error) {
    next(error)
  }
}

export const getUserById = async(req,res,next)=>{
  const {id} = req.params;
  console.log(id);
  try {    
  const user = await User.findById(id)
  if(!user){
    next(errorHandler(404,"User not found."))
  }
  res.status(200).json({message:"Fetched user successfully.",user})
  console.log(user)
  } catch (error) {
    next(error)
  } 
}