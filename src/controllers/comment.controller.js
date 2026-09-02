import mongoose, {isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }

    const comments = await Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Comments fetched successfully", comments)
        )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {comment} = req.body;
    const {videoId} = req.params;
    const userId = req.user._id;

    if(!comment) {
        throw new ApiError(400, "Comment content is required")
    }
    
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    const newComment = await Comment.create({
        content: comment,
        video: videoId,
        owner: userId
    })

    if(!newComment) {
        throw new ApiError(500, "Failed to add comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(true, "Comment added successfully", newComment))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {content} = req.body;
    const {commentId} = req.params;
    const userId = req.user._id;

    if(!content) {
        throw new ApiError(400, "Comment content is required")
    }

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

    if(comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not the owner of this comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId, { content }, { new: true });

    return res
        .status(200)
        .json(new ApiResponse(true, "Comment updated successfully", updatedComment))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;
    const userId = req.user._id;

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

    if(comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not the owner of this comment")
    }

    await Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(new ApiResponse(true, "Comment deleted successfully", null))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }