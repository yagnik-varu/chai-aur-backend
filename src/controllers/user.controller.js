import  User  from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefrenceToken = async (user_id)=>{
    try{
        const user = await User.findById(user_id);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.genrateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    }catch(error){
        throw new ApiError(500,"something went wrong while generating refrence and access tokens")
    }
}

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

const loginUser = asyncHandler(async (req,res)=>{
    const {email,username,password} = req.body
    console.log(req.body)

    if(!(username || email)){
        throw new ApiError(400,"email or username is required");
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"user not exist");
    }
console.log(password)
    const isPasswordValid = await user.isPasswordCorrect(password);
    console.log(isPasswordValid)
    if(!isPasswordValid){
        throw new ApiError(401,"password incorrect invlaid credential");
    }

    const {accessToken,refreshToken} = await generateAccessAndRefrenceToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    
    //modified by only server
    const options = {
        httpOnly:true,
        secure:true
    }

    return res.status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",refreshToken,options)
            .json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"user logged in successfully"));
})

const logOutUser = asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
        
    )
    const options = {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200),{},"you are logout successfully")
    
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        if(!decodedToken){
            throw new ApiError(401,"invalid refresh token")
        }
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401,"invalid refresh token structure")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"refresh token is expired or used");
        }
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefrenceToken(user._id);
        const options = {
            httpOnly:true,
            secure:true
        }
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshtoken:newRefreshToken,
                },
                "token generated succesfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "error occured in token generation" )
        
    }

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body

    const user = User.findById(req.user?._id);
    if(!user){
        throw ApiError(401,"user is not defined");
    }
    const correctPassword =  user.isPasswordCorrect(oldPassword);
    if(!correctPassword){
        throw ApiError(401,"old password is not match")
    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(
        new ApiError(200,"password changed successfully")
    )
})


const getCurrentUser = asyncHandler(async (req,res)=>{
    return res.status(200)
            .json(200,"current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async (req,res)=>{
    const {fullname,email} = req.body
    if(!(fullname||email)){
        throw new ApiError(400,"All field are required");
    }
    const user = User.findByIdAndUpdate(
        req.user._id,
        {
            fullname,
            email
        },
        {new:true}
    ).select("-password");

    return res.status(200).json( new ApiResponse(200,"account details updated successfully"));
})

const updateUserAvatar = asyncHandler(async(req,res)=>{

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar path is missing")
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url){
        throw new ApiError(500,"error while uploadin avatar")
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar:avatar
            }
        },
        {
            new:true
        }
    ).select("-password")
    return res.status(200).json(new ApiResponse(200,user,"avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{

    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"coverImage path is missing")
    }

    const coverImage= await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar.url){
        throw new ApiError(500,"error while uploadin cover image")
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage:coverImage
            }
        },
        {
            new:true
        }
    ).select("-password")
    return res.status(200).json(new ApiResponse(200,user,"cover image updated successfully"))
})

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
}