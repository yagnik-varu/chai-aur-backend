import mongoose, {isValidObjectId} from "mongoose"
import Playlist from "../models/playlist.model.js"
import Video from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if ([name, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required !!")
    }
    const newPlaylist =await Playlist.create({
        name,
        description,
        owner:req.user._id
    })
    if(!newPlaylist){
        throw new ApiError(500, "something error in create playlist")
    }
    return res.status(200).json(
        new ApiResponse(200,newPlaylist,"playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const userPlaylists =await Playlist.find({owner:userId},{}) 
    console.log(userPlaylists);
    console.log("this is user's playlist")
    if(!userPlaylists.length>0){
        return res.status(200).json(
            new ApiResponse(200,{},"user has no any playlist")
        )
    }
    return res.status(200).json(
        new ApiResponse(200,userPlaylists,"successfully fetched user's playlist")
    )
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId) 
    if(!playlist){
        return res.status(200).json(
            new ApiResponse(200,{},"no playlist found for given id")
        )
    }
    return res.status(200).json(
        new ApiResponse(200,playlist,"successfully fetched playlist")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    console.log("inside add video playlist")
    const {playlistId, videoId} = req.params
    const playlist = await Playlist.findById(playlistId) 
    console.log("playlist",playlist)
    if(!playlist){
        return res.status(200).json(
            new ApiResponse(200,{},"no playlist found for given id")
        )
    }
    
    const providedVideo = await Video.findById(videoId);
    console.log("provided video",providedVideo)
    if(!providedVideo){
        return res.status(200).json(
            new ApiResponse(200,{},"no video found for given id")
        )
    }
    const videoExistInPlaylist = await Playlist.find(
        {
            videos:videoId
        },{}
    )
    
    if(videoExistInPlaylist.length>0){
        return res.status(200).json(
            new ApiResponse(200,{},"video allredy exist in playlist")
        )
    }


    const addedVideo = await playlist.videos.push(providedVideo._id)
    await playlist.save();
    if(!addedVideo){
        throw new ApiError(500,"changes are not made in playlist");
    }
    console.log("added video return",addedVideo)
    const updatedPlaylist = await Playlist.findById(playlistId).populate('videos')
    return res.status(200).json(
        new ApiResponse(200,updatedPlaylist,"video added to playlist")
    )
    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const playlist = await Playlist.findById(playlistId) 
    if(!playlist){
        return res.status(200).json(
            new ApiResponse(200,{},"no playlist found for given id")
        )
    }
    
    
    const providedVideo = await Video.findById(videoId);
    if(!providedVideo){
        return res.status(200).json(
            new ApiResponse(200,{},"no video found for given id")
        )
    }
    const afterRemoveVideo  = await playlist.videos.pull(videoId);
    await playlist.save();
    console.log(afterRemoveVideo);
    return res.status(200).json(
        new ApiResponse(200,{},"video deleted to playlist")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const deletedPlaylist =await Playlist.findByIdAndDelete(playlistId);
    if(!deletedPlaylist){
        return res.status(200).json(
            new ApiResponse(200,{},"no playlist deleted may be id is wrong")
        )
    }
    return res.status(200).json(
        new ApiResponse(200,{},"playlist deleted successfully")
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    try {
        const {playlistId} = req.params
        const {name, description} = req.body
        //TODO: update playlist
        const updatedPlaylist =await Playlist.findByIdAndUpdate(
            playlistId,
            {
                name,
                description
            },
            {
                new:true
            }
        )
    
    
        if(!updatePlaylist){
            throw new ApiError(500, "error while updating playlist")
        }
        return res.status(200).json(
            new ApiResponse(200,updatedPlaylist,"playlist updated successfully")
        )
    } catch (error) {
        console.log(error)   
    }

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}