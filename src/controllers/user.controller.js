import mongoose from "mongoose";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { removeFromCloudinary } from "../utils/removeCloudinaryUpload.js";


const generateAccessAndRefrenceToken = async (user_id) => {
    try {
        const user = await User.findById(user_id);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.genrateRefreshToken()
        console.log("generate access and refresh",refreshToken)

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { newAccessToken:accessToken, newRefreshToken:refreshToken }
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refrence and access tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { username, email, fullname, password } = req.body;
    console.log(req.body,req.files)
    // return res.json(req.files);
    if ([username, email, fullname, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required !!")
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        // const userAlreadyExistsError = new ApiError(409, 'User already exists !!');
        // return res.status(409).json(userAlreadyExistsError);
        // return res.status(409).json(new ApiError(409, 'User already exist !!'))
        throw new ApiError(409, 'User already exists !!');
    }

    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        console.log("inside if")
        avatarLocalPath = req.files?.avatar[0]?.path;
    }
    // console.log(avatarLocalPath)
    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        console.log("inside if")
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }
    console.log("cover image local path", coverImageLocalPath)
    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar is required !!')
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log("avatar", avatar)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, 'maybe cloudinary connection error try after some time!!--');
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, 'Something went wrong while registering user')
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, 'User registred succesfully')
    )

})

const loginUser = asyncHandler(async (req, res) => {
    console.log('inside login user')
    const { email, username, password } = req.body
    console.log(req.body)

    if (!(username || email)) {
        throw new ApiError(400, "email or username is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "user not exist");
    }
    console.log(password)
    const isPasswordValid = await user.isPasswordCorrect(password);
    console.log(isPasswordValid)
    if (!isPasswordValid) {
        throw new ApiError(401, "password incorrect invlaid credential");
    }

    const { newAccessToken, newRefreshToken } = await generateAccessAndRefrenceToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    //modified by only server
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken:newAccessToken, refreshToken:newRefreshToken }, "user logged in successfully"));
})

const logOutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }

    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200), {}, "you are logout successfully")

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    console.log(req.cookies)

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        if (!decodedToken) {
            throw new ApiError(401, "invalid refresh token")
        }
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "invalid refresh token structure")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is expired or used");
        }

        const { newAccessToken, newRefreshToken } = await generateAccessAndRefrenceToken(user._id);
        // const { refreshToken: newRefreshToken, accessToken } = await generateAccessAndRefreshToken(
            // user._id
        // );
        const options = {
            httpOnly: true,
            secure: true
        }
        console.log(" new refresh token",newRefreshToken)
        return res
            .status(200)
            .cookie("accessToken", newAccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken:newAccessToken,
                        refreshToken: newRefreshToken,
                    },
                    "token generated succesfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "error occured in token generation")

    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user =await User.findById(req.user?._id);
    if (!user) {
        throw ApiError(401, "user is not defined");
    }
    console.log(user)
    const correctPassword =await user.isPasswordCorrect(oldPassword);
    console.log(correctPassword)
    if (!correctPassword) {
        throw new ApiError(401, "old password is not match")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res
        .status(200)
        .json(
            new ApiResponse(200,{}, "password changed successfully")
        )
})


const getCurrentUser = asyncHandler(async (req, res) => {
    const user =await User.findById(req.user?._id);
    return res.status(200)
        .json(200, "current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    console.log('inside update account details');
    const { fullname, email } = req.body
    if (!(fullname || email)) {
        throw new ApiError(400, "All field are required");
    }
    console.log(fullname)
    const user =await User.findByIdAndUpdate(
        req.user._id,
        {
            fullname,
            email
        },
        { new: true }
    ).select("-password");
    console.log(user)
    return res.status(200).json(new ApiResponse(200,user, "account details updated successfully"));
})

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path
    // console.log(avatarLocalPath)
    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar path is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(500, "error while uploadin avatar")
    }
    const oldUrl = await User.findById(req.user._id).select("avatar")
    await removeFromCloudinary(oldUrl.avatar)
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")
    return res.status(200).json(new ApiResponse(200, user, "avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {

    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "coverImage path is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new ApiError(500, "error while uploadin cover image")
    }
    const oldUrl = await User.findById(req.user._id).select("coverImage")
    await removeFromCloudinary(oldUrl.coverImage)
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")
    return res.status(200).json(new ApiResponse(200, user, "cover image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id", // give array of all user who subsribed channel
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriber",
                localField: "_id", //  give array of all chanel whom has subscribed by user
                foreignField: "channel",
                as: "subscribersTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channlSubscriberToCount: {
                    $size: "$subscribersTo"
                },
                isSubscribed: {//on current channel user subscribe or not to show
                    $cond: {
                        if: { $in: [req.user?._id, "subscribers"] },//check user's id is present or not in subscribers array
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channlSubscriberToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exist")
    }
    return res.status(200)
        .json(
            new ApiResponse(200, channel[0], "user channel fetched successfully")
        )
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId.createFromHexString(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(
        ApiResponse(200, user[0].watchHistory),
        "watch history fetched successfully"
    )
})



export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getWatchHistory,
    getUserChannelProfile,

}