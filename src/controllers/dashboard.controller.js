import mongoose from "mongoose"
import Video from "../models/video.model.js"
import Subscription from "../models/subscription.model.js"
import Like from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  // console.log(req.user._id)
  try {
    const pipeline = [
      {
        $match: {
          owner: req.user._id
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "owner",
          foreignField: "channel",
          as: "subscriberPerVideo",
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likePerVideo",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "video",
          as: "commentPerVideo",
        },
      },
      {
        $addFields: {
          likePerVideo: {
            $size: "$likePerVideo",
          },
          commentPerVideo: {
            $size: "$commentPerVideo",
          },
          subscriberPerVideo: {
            $size: "$subscriberPerVideo",
          },
        },
      },
      {
        $group: {
          _id: null,
          totalDuration: {
            $sum: "$duration",
          },
          totalVideo: {
            $sum: 1,
          },
          totalViews: {
            $sum: "$views",
          },
          totalSubscriber: {
            $sum: "$subscriberPerVideo",
          },
          totalComments: {
            $sum: "$commentPerVideo",
          },
          totalLiked: {
            $sum: "$likePerVideo",
          },
        },
      },
      {
        $addFields: {
          totalSubscriber: {
            $divide: ["$totalSubscriber", "$totalVideo"]
          }
        }
      }
    ]
    const channelInfo = await Video.aggregate(pipeline)
    if (!channelInfo) {
      throw new ApiError('401', "failed to fetch channel info")
    }
    return res.status(200).json(
      new ApiResponse(200, channelInfo, "info fetched successfully")
    )
  } catch (error) {
    console.log(error)
    throw new ApiError(500, "something wrong while fetching channel info", error.message)
  }
})

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
  let pipeline = [];
  console.group(userId)

  pipeline.push(
    {
      $match: {
        owner: req.user._id
      }
    }
  )


  if (query) {
    pipeline.push({ $match: { query } })
  }

  if (sortBy && sortType) {
    let condition = {}
    condition[sortBy] = (sortType === "desc") ? (Number(-1)) : (Number(1))
    pipeline.push({ $sort: condition })
  }
  // ****** SORT TYPE IS NOT WORK WELL FIX IT AFTER

  const videoAggregate = await Video.aggregate(pipeline)

  // return res.json(video)


  Video.aggregatePaginate(videoAggregate, { page, limit })
    .then(function (result) {
      return res.status(200).json(
        new ApiResponse(200, result, "video fetched successfully")
      )
    })
    .catch(function (error) {
      return res.status(401).json(
        new ApiError(200, "error in video fetched ", error.message)
      )
    })

})

export {
  getChannelStats,
  getChannelVideos
}