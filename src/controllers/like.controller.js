import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const likedBy = req.user._id;
    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found");
    }

    const like = await Like.findOne({ video: videoId, likedBy });

    if(!like){
        // Create a new like
        const newLike = await Like.create({ video: videoId, likedBy });
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Video liked successfully", newLike)
            )

    }else{
        // Remove the existing like
        await Like.deleteOne({ _id: like._id });
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Video unliked successfully", null)
            )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID");
    }

    const likedBy = req.user._id;
    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(404, "Comment not found");
    }

    const like = await Like.findOne({ comment: commentId, likedBy });

    if(!like){
        // Create a new comment like
        const newLike = await Like.create({ comment: commentId, likedBy });
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Comment liked successfully", newLike)
            )

    }else{
        // Remove the existing comment like
        await Like.deleteOne({ _id: like._id });
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Comment unliked successfully", null)
            )
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID");
    }

    const likedBy = req.user._id;
    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }

    const like = await Like.findOne({ tweet: tweetId, likedBy });

    if(!like){
        // Create a new tweet like
        const newLike = await Like.create({ tweet: tweetId, likedBy });
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Tweet liked successfully", newLike)
            )

    }else{
        // Remove the existing tweet like
        await Like.deleteOne({ _id: like._id });
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Tweet unliked successfully", null)
            )
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedBy = req.user._id;
    const likedVideos = Like.aggregate([
        {
            $match: {
                likedBy: likedBy,
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Liked videos fetched successfully", likedVideos)
        )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}