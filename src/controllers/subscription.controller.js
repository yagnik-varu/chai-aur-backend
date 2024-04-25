import mongoose, {isValidObjectId} from "mongoose"
import User from "../models/user.model.js"
import  Subscription  from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    // if pair of channelId and subscriber User id match then delete pair
    // otherwise add it
    try {
        let currentSubscribed=false
        const object =await Subscription.find({
            $and:[{subscriber:req.user._id},{channel:channelId}]
        },{})
        if(object.length>0){
            await Subscription.findOneAndDelete({
                $and:[{subscriber:req.user._id},{channel:channelId}]
            })
        }else{
            await Subscription.create({
                subscriber:req.user._id,
                channel:channelId
            })
            currentSubscribed=true
        }
        return res.status(200).json(
            new ApiResponse(200,{currentSubscribed},"toggled successfully")
        )
    } catch (error) {
        console.log(error)
        throw new ApiError(401,"error in toggle subscription",error.message)   
    }


})

// controller to return subscriber list of a channel
const getChannelSubscribers = asyncHandler(async (req, res) => {
    try {
        const {channelId} = req.params
        //select object where channel id = given id
        const object =await Subscription.find({
            "channel":channelId
        },{})
        console.log(object)
        if(!object.length>0){
            return res.status(403).json(
                new ApiResponse(403,{},"no subscriber found")
            )
        }else{
            return res.status(200).json(
                new ApiResponse(200,object,"subscriber collected successfully")
            )
        }
    } catch (error) {
        throw new ApiError(401,"something wrong while fetching subscriber",error.message)
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    console.log("in side ")
    try {
        const { subscriberId } = req.params
        console.log(subscriberId)
        //select object where subscriber id = given id
        const object =await Subscription.find({
            "subscriber":subscriberId
        })
        console.log(object)
        if(!object.length>0){
            return res.status(403).json(
                new ApiResponse(403,{},"no channel is subscribed by user")
            )
        }else{
            return res.status(200).json(
                new ApiResponse(200,object,"subscribed channel list found")
            )
        }
    } catch (error) {
        throw new ApiError(401,"something wrong while fetching subscribed channel by user",error.message)
    }
})

export {
    toggleSubscription,
    getChannelSubscribers,
    getSubscribedChannels
}