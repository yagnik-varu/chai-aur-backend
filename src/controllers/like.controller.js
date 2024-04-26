import mongoose, {isValidObjectId} from "mongoose"
import Like from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    try {
        const {videoId} = req.params
        let message="video removed form liked Video";
        const videoExist = await Like.findOneAndDelete({
            video:videoId,
            likedBy:req.user._id
        })
            
        if(!videoExist){
            await Like.create({
                video:videoId,
                likedBy:req.user._id
            })
            message="video liked successfully";
        }
        return res.status(200).json(
            new ApiResponse(200,{},message)
        )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(500,"something wrong while operation on video like",error.message) 
    }
    
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    try {
        const {commentId} = req.params
        let message="comment removed form liked comment";
        const commentExist = await Like.findOneAndDelete({
            comment:commentId,
            likedBy:req.user._id
        })
            
        if(!commentExist){
            await Like.create({
                comment:commentId,
                likedBy:req.user._id
            })
            message="comment liked successfully";
        }
        return res.status(200).json(
            new ApiResponse(200,{},message)
        )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(500,"something wrong while operation on comment like",error.message) 
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    try {
        const {tweetId} = req.params
        let message="tweet removed form liked tweet";
        const tweetExist = await Like.findOneAndDelete({
            tweet:tweetId,
            likedBy:req.user._id
        })
            
        if(!tweetExist){
            await Like.create({
                tweet:tweetId,
                likedBy:req.user._id
            })
            message="tweet liked successfully";
        }
        return res.status(200).json(
            new ApiResponse(200,{},message)
        )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(500,"something wrong while operation on tweet like",error.message) 
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
   

    const likedVideos = await Like.find({video:{$exists:true}}).populate('video')
    if(!likedVideos){
        return res.status(200).json(
            new ApiResponse(200,{},"no video is liked by user")
        )
    }
    return res.status(200).json(
        new ApiResponse(200,likedVideos,"video get successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}