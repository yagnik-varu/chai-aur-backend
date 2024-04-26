import mongoose from "mongoose"
import Tweet from '../models/tweet.model.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    if(!content){
        throw new ApiError(401,"content is not present");
    }
    const newTweet = await Tweet.create({
        content,
        owner:req.user._id
    })
    if(!newTweet){
        throw new ApiError(500,"erorr while store tweet in database");
    }
    return res.status(200).json(
        new ApiResponse(200,newTweet,"tweet created successfully")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    try {
        const {userId} = req.params
        const userTweet = await Tweet.find(
            {owner:userId},
            {}
        )
        if(!userTweet){
            throw new ApiError(401,"provided id is not valid");
        }
        return res.status(200).json(
            new ApiResponse(200,userTweet,"All user's tweet")
        )
    } catch (error) {
        throw new ApiError(401,"may be your provided id is not correct",error.message);
    }

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    try {
        const {content} = req.body
        const {tweetId} = req.params
        if(!content){
            throw new ApiError(401,"content is not present");
        }
        const updateTweet =await Tweet.findByIdAndUpdate(
            tweetId,
            {content},
            {new:true})
        if(!updateTweet){
            throw new ApiError(500,"erorr while edit tweet in database");
        }
        return res.status(200).json(
            new ApiResponse(200,updateTweet,"tweet edited successfully")
        )
    } catch (error) {
        throw new ApiError(401,"may be your provided id is not correct",error.message);
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    try {
        const {tweetId} = req.params;
        const status = await Tweet.findByIdAndDelete(tweetId);
        if(!Boolean(status)){
            return res.status(200).json(
                new ApiResponse(401,{},"provided id is not valid")
            )
        }
        return res.status(200).json(
            new ApiResponse(200,{},"tweet deleted successfully")
        )
    } catch (error) {
        throw new ApiError(401,"provided id is not valid",error.message);
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}