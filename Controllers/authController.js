import User from "../Models/userModel.js";
import { errorHandler } from "../Utils/Error.js";
import bcryptjs from 'bcryptjs';

export const registerUser = async(req,res,next)=>{
    const {username,email,password} = req.body;
    if(!username || !email || !password || username==="" || email ===""||password ===""){
        return next(errorHandler(400,'All the Fields are Required'))
    }
    const hashedPassword = bcryptjs.hashSync(password,10);

    const newUser = new User({username,email,password:hashedPassword});
    try {
        await newUser.save();
        res.status(200).json({message:'User Registered Successfully',result:newUser});
    } catch (error) {
        next(error);
    }
}