import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    const userId = req.user._id;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }
    
    const tweet = await Tweet.create({
        content,
        owner: userId
    });

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;
    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const user = await User.findById(userId);
    if(!user) {
        throw new ApiError(404, "User not found")
    }

    const tweets = await Tweet.aggregate([
        {
            $match: { 
                owner: new mongoose.Types.ObjectId(userId) 
            }
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
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {content} = req.body;
    const {tweetId} = req.params;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404, "Tweet does not exist");
    }
    if(tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Tweet can only be updated by the owner");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { content },
        { new: true }
    );

    if (!updatedTweet) {
        throw new ApiError(404, "Tweet not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404, "Tweet does not exist");
    }

    if(tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Tweet can only be deleted by the owner");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}