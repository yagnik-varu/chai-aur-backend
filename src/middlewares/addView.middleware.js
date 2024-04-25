//save video id in user's watch history

import { asyncHandler } from "../utils/asyncHandler.js";
import Video from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";



const addView = asyncHandler(async(req,res,next)=>{
    const clickedVideo = await Video.findById(req.params.id);
    if(!clickedVideo){
        throw new ApiError(400,"invalid video id",)
    }
    clickedVideo.views +=1
    await clickedVideo.save()
    next()
})

export {addView};