//save video id in user's watch history

import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";



const addHistory = asyncHandler(async(req,res,next)=>{
    const videoId = req.params.id;
    console.log(videoId)
    const user =await User.findById(req.user._id)
    user.watchHistory.push(videoId); 
    await user.save({validateBeforeSave:false})
    next()
})

export {addHistory};