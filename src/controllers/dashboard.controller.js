import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getChannelStats = asyncHandler(async (req, res) => {
    // Get the channel stats like total video views,
    // total subscribers, total videos, total likes etc.

    const channelId = req.user._id;

    const totalVideos = await Video.countDocuments({
        owner: channelId
    });

    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    });

    const videos = await Video.find({
        owner: channelId
    }).select("_id views");

    const totalViews = videos.reduce(
        (total, video) => total + video.views,
        0
    );

    const videoIds = videos.map(video => video._id);

    const totalLikes = await Like.countDocuments({
        video: { $in: videoIds }
    });

    const stats = {
        totalVideos,
        totalSubscribers,
        totalViews,
        totalLikes
    };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                stats,
                "Channel stats fetched successfully"
            )
        );
})


const getChannelVideos = asyncHandler(async (req, res) => {
    // Get all the videos uploaded by the channel

    const channelId = req.user._id;

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                }
            }
        },
        {
            $project: {
                likes: 0
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "Channel videos fetched successfully"
            )
        );
})


export {
    getChannelStats,
    getChannelVideos
}

