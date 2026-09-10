import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    if(!name) {
        throw new ApiError(400, "Playlist name is required")
    }
    if(!description) {
        throw new ApiError(400, "Playlist description is required")
    }
    const newPlaylist = await Playlist.create({
        name,
        description,
        owner: mongoose.Types.ObjectId(req.user._id)
    })
    return res
    .status(201)
    .json(new ApiResponse(201, newPlaylist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const user = await User.findById(userId);
    if(!user) {
        throw new ApiError(404, "User not found")
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])
    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "User playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404, "Video not found")
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if(playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the owner of the playlist can add videos")
    }
    if(playlist.videos.some(id => id.toString() === videoId)) {
        throw new ApiError(400, "Video already exists in the playlist")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $push: {videos: videoId}
    }, {new: true})
    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404, "Video not found")
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if(playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the owner of the playlist can delete videos")
    }
    if(!playlist.videos.some(id => id.toString() === videoId)) {
        throw new ApiError(400, "Video does not exist in the playlist");
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $pull: {videos: videoId}
    }, {new: true})
    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if(playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the owner of the playlist can delete it")
    }
    await Playlist.findByIdAndDelete(playlistId);
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if(playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the owner of the playlist can update it")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {name, description}, {new: true})
    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))
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