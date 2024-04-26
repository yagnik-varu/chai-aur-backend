import mongoose from "mongoose"
import Comment from '../models/comment.model.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    //PAGINATE IS IN PENDING
    const { videoId } = req.params
    const { page = 1, limit = 1 } = req.query
    console.log(req.query)
    var commentAggregate = Comment.aggregate();
    Comment.aggregatePaginate(commentAggregate, { page, limit })
        .then(function (result) {
            console.log(result)
            return res.status(200).json(
                new ApiResponse(200,result,"comment paginate successfully")
            )
        })
        .catch(function (err) {
            console.log(err)
            return res.status(400).json(
                new ApiError(400,"something error in comment fetch",err.message)
            )
        })


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content } = req.body
    // console.log(content)
    const { videoId } = req.params
    if (!content) {
        throw new ApiError('401', "content is not present")
    }
    const comment = await Comment.create(
        {
            content,
            video: videoId,
            owner: req.user._id
        }
    )
    return res.status(200).json(
        new ApiResponse(200, comment, "comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    const { commentId } = req.params
    if (!content) {
        throw new ApiError('401', "content is not present")
    }
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content
        },
        {
            new: true
        }
    )
    if (!updatedComment) {
        throw new ApiError(401, "your requested commnet id is invalid")
    }
    return res.status(200).json(
        new ApiResponse(200, updatedComment, "comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params
        await Comment.findOneAndDelete({
            _id: commentId
        })
        return res.status(200).json(
            new ApiResponse(200, {}, "comment deleted successfully")
        )
    } catch (error) {
        throw new ApiError(401, "there is error in comment delete", error.message)
    }


})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}