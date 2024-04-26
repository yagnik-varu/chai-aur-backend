
//upload video on cloudnary first in local machine secound in cloudnary
//upload video thumbnail 
import mongoose,{ObjectId} from "mongoose";

import User from "../models/user.model.js";
import Video from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { removeFromCloudinary } from "../utils/removeCloudinaryUpload.js";

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    console.log("req.body", req.body)
    console.log("req.files", req.files)
    const videoLocalPath = req.files?.video[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if ([title, description, videoLocalPath, thumbnailLocalPath].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required !!")
    }

    let videoFile = await uploadOnCloudinary(videoLocalPath);
    let thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile) {
        videoFile = await uploadOnCloudinary(videoLocalPath);
    }
    if (!thumbnail) {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    }
    if (!videoFile) {
        throw new ApiError(500, "problem in uploading video");
    }
    if (!thumbnail) {
        throw new ApiError(500, "problem in uploading thumbnail");
    }
    console.log("thumbnail", thumbnail)
    console.log("videoFile", videoFile)

    const videoDuration = videoFile.duration
    const uploadVideo = await Video.create(
        {
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            title,
            description,
            duration: videoDuration,
            owner: req.user._id

        }
    )
    console.log("uploadedVideo", uploadVideo)

    return res
        .status(200)
        .json(new ApiResponse(200, { uploadVideo }, "video uploaded succesfully"))

})


const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    let pipeline = [];
    console.group(userId)
    if(userId){
        pipeline.push(
            {
                $match: {
                    owner:mongoose.Types.ObjectId.createFromHexString(userId)
                }
              }
        )
    }

    if(query){
        pipeline.push({$match:{query}})
    }
    
    if(sortBy&&sortType){
        let condition = {}
        condition[sortBy]=(sortType==="desc")?(Number(-1)):(Number(1))
        pipeline.push({$sort:condition})
    }
    // ****** SORT TYPE IS NOT WORK WELL FIX IT AFTER

    const videoAggregate =await Video.aggregate(pipeline)

    // return res.json(video)


    Video.aggregatePaginate(videoAggregate,{page,limit})
            .then(function(result){
                return res.status(200).json(
                    new ApiResponse(200,result,"video fetched successfully")
                )
            })
            .catch(function(error){
                return res.status(401).json(
                    new ApiError(200,"error in video fetched ",error.message)
                )
            })
})

const getVideoById = asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.id);
    if (!video) {
        return res.status(400).json(
            new ApiResponse(400, {}, "invalid id")
        )
    }
    return res.status(200).json(
        new ApiResponse(200, video, "success")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {

    try {
        const videoId = req.params.id
        const video = await Video.findById(videoId)
        if (!videoId) {
            throw new ApiError(401, "video id is not present")
        }
        console.log(video.videoFile)
        await removeFromCloudinary(video.videoFile, true)
        await removeFromCloudinary(video.thumbnail)
        await Video.findByIdAndDelete(videoId)
        return res.status(200).json(new ApiResponse(200, "video deleted successfully"))
    } catch (error) {
        throw new ApiError(501, "something wrong in remove video", error)
    }
})

const updateVideo = asyncHandler(async (req, res) => {
    const videoId = req.params.id
    const newThumbnailPath = req.file?.path
    const { title, description } = req.body;
    if ([title, description,newThumbnailPath].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required !!")
    }

    const oldVideo = await Video.findById(videoId)
    if (!oldVideo) {
        throw new ApiError(401, "invalid id parameter");
    }
    //TODO: update video details like title, description, thumbnail
    const oldVideoThumbnail = oldVideo.thumbnail;
    const newThumbnail = await uploadOnCloudinary(newThumbnailPath)
    if (!newThumbnailPath) {
        throw new ApiError(501, "error in file upload");
    }
    console.log(oldVideoThumbnail)
    await removeFromCloudinary(oldVideoThumbnail)

    const updatedVideo =await Video.findByIdAndUpdate(videoId,{
        title,
        thumbnail: newThumbnail.url,
        description,
    }, {
        $new: true
    })
    
    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "video updated successfully")
    )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const  videoId  = req.params.id
    const video =await Video.findById(videoId);
    if(!video){
        throw new ApiError(401,"invalid parameter given")
    }
    video.isPublished = !video.isPublished
    await video.save();
    return res.status(200).json(new ApiResponse(200,{},"operation successfull"));
})


export { publishAVideo, getAllVideos, getVideoById, deleteVideo, updateVideo,togglePublishStatus }



