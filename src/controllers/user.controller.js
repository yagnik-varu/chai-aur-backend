import  User  from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
    const {username, email, fullname, password} = req.body;
    if([username, email, fullname, password].some((field) => field?.trim() === "" )){
        throw new ApiError(400, "All fields are required !!")
    }
    const existedUser = await User.findOne({
        $or:[{ username }, { email }]
    });

    if(existedUser){
        throw new ApiError(409, 'User already exist !!')
    }

    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log(avatarLocalPath)
    let coverImageLocalPath;
    
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        console.log("inside if")
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }
    console.log("cover image local path",coverImageLocalPath)
    if(!avatarLocalPath) {
        throw new ApiError(400, 'Avatar is required !!')
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log("avatar",avatar)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   
    if(!avatar){
        throw new ApiError(400, 'maybe cloudinary connection error try after some time!!--');
    }

   const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, 'Something went wrong while registering user')
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, 'User registred succesfully')
    )
    
})

export {
    registerUser,
}