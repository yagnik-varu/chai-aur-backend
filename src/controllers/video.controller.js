
//upload video on cloudnary first in local machine secound in cloudnary
//upload video thumbnail 

import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadVideoAndSave = asyncHandler(async(req,res)=>{
    const {title,description} = req.body
    console.log("req.body",req.body)
    console.log("req.files",req.files)
    const videoLocalPath = req.files?.video[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if([title,description,videoLocalPath,thumbnailLocalPath].some((field) => field?.trim() === "" )){
        throw new ApiError(400, "All fields are required !!")
    }

    let videoFile = await uploadOnCloudinary(videoLocalPath);
    let thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoFile){
        videoFile = await uploadOnCloudinary(videoLocalPath);
    }
    if(!thumbnail){
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    }
    if(!videoFile){
        throw new ApiError(500,"problem in uploading video");
    }
    if(!thumbnail){
        throw new ApiError(500,"problem in uploading thumbnail");
    }
    console.log("thumbnail",thumbnail)
    console.log("videoFile",videoFile)

    const videoDuration = videoFile.duration
    const uploadVideo =await Video.create(
        {
            videoFile:videoFile.url,
            thumbnail:thumbnail.url,
            title,
            description,
            duration:videoDuration,
            owner:req.user._id

        }
    )
    console.log("uploadedVideo",uploadVideo)

    return res
        .status(200)
        .json(new ApiResponse(200,{uploadVideo},"video uploaded succesfully"))

})

export {uploadVideoAndSave}



