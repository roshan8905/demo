import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;
    //TODO: get all videos based on query, sort, pagination

    const matchStage = {
        isPublished : true
    }

    if(query){
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }
    if(userId){
        if(!isValidObjectId(userId)) {
            throw new ApiError(400,"Invalid userId");
        }
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }
    const sortStage = {
        [sortBy]: sortType === "asc" ? 1 : -1
    };
    
    const aggregate = Video.aggregate([
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            avatar: 1,
                            fullname: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $sort: sortStage
        }
    ])
    
    const options = {
        page: Number(page),
        limit: Number(limit)
    };

    const videos = await Video.aggregatePaginate(aggregate,options);
    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if(!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }
    if(!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required");
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    const video = await uploadOnCloudinary(videoLocalPath, "video");
    if(!thumbnail.url){
        throw new ApiError(400, "Error while uploading thumbnail");
    }
    if(!video.url){
        throw new ApiError(400, "Error while uploading video");
    }
    const newVideo = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: video.duration,
        owner: mongoose.Types.ObjectId(req.user._id)
    })

    return res
        .status(201)
        .json(new ApiResponse(201, newVideo, "Video published successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }
    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404, "Video not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body;
    const thumbnailLocalPath = req.file?.path;
    
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }
    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    if(req.user._id.toString() !== video.owner.toString()) {
        throw new ApiError(403, "Only the owner can update the video");
    }
    
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail file is required");
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if(!thumbnail.url){
        throw new ApiError(400, "Error while uploading thumbnail");
    }
    
    const updatedVideo = await Video.findByIdAndUpdate(videoId, {
        title,
        description,
        thumbnail: thumbnail.url
    }, { new: true })

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }
    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404, "Video not found")
    }
    if(req.user._id.toString() !== video.owner.toString()) {
        throw new ApiError(403, "Only the owner can delete the video");
    }
    await Video.findByIdAndDelete(videoId);
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Video deleted successfully"));

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }
    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404, "Video not found")
    }
    if(req.user._id.toString() !== video.owner.toString()) {
        throw new ApiError(403, "Only the owner can update publish status of the video");
    }
    const updatedPublishStatusVideo = await Video.findByIdAndUpdate(videoId,{isPublished : !video.isPublished},{new : true});
    if(video.isPublished){
        return res.status(200).json(new ApiResponse(200, updatedPublishStatusVideo, "Video unpublished successfully"));
    }
    return res.status(200).json(new ApiResponse(200, updatedPublishStatusVideo, "Video published successfully"));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}