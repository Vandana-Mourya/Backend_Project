import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiErrors } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, videoIds } = req.body

    if (!(name || description)) {
        throw new ApiErrors(400, "Name and description of the playlist is required")
    }


    // Validate videoIds to ensure it's an array
    if (!Array.isArray(videoIds)) {
        throw new ApiErrors(400, "Not an array");
    }

    if(videoIds.length === 0){
        throw new ApiErrors(400, "array is empty")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
        video: videoIds
    })

    const populatedPlaylist = await Playlist.findById(playlist._id)
    .populate({
        path: 'video',
        populate:{
            path:"owner",
            select: "fullName username avatar -_id"
        }
    })


    return res
    .status(200)
    .json(
        new ApiResponse(200, "Playlist created successfully!",{playlist:populatedPlaylist})
    )
})

const getUserPlaylist = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const getPlaylist = await Playlist.find({owner:userId})

    if(getPlaylist.length === 0){
        throw new ApiErrors(400, "Playlist not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, "Playlist fetched successfully!", {getPlaylist,
            totalPlaylist: getPlaylist.length
        })
    )
})

const getPlaylistById = asyncHandler(async(req, res) => {
    const { playlistId } = req.params

    const getPlaylist = await Playlist.findById(playlistId)

    if(!getPlaylist){
        throw new ApiErrors(400, "Playlist not found of this Id")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Here is your playlist", getPlaylist)
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoIds} = req.params
    const videoIdArray = videoIds.split(',')

    const addVideo = await Playlist.findOneAndUpdate({owner:req.user._id, _id: playlistId}, {
        $addToSet:{
            video:{ $each: videoIdArray }
        }
    }, {new:true})

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Playlist got updated!", addVideo)
    )
})

const removeAVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoIds} = req.params
    const videoIdArray = videoIds.split(',')
    
    const removeVideo = await Playlist.findOneAndUpdate({owner: req.user._id, _id: playlistId}, {
        $pull:{
            video:{$in: videoIdArray}
        }
    },{new : true})

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Video/Videos removed from playlist successfully!", removeVideo)
    )
})

const updatePlaylist = asyncHandler(async(req,res) => {
    const {name, description} = req.body
    const {playlistId} =req.params

    if(!(name || description)){
        throw new ApiErrors(400, "Both fields are required!")
    }

    const update = await Playlist.findOneAndUpdate({owner: req.user._id, _id:playlistId}, {
        $set:{
            name,
            description
        }
    }, {new: true})

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Playlist got updated", update)
    )
})

const deletePlaylist = asyncHandler(async(req, res) => {
    const {playlistId} = req.params

    const delPlaylist = await Playlist.findOneAndDelete({owner: req.user._id, _id: playlistId})

    if(!delPlaylist){
        throw new ApiErrors(400, "Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Playlist got deleted!", delPlaylist)
    )
})


export {
    createPlaylist,
    getUserPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    removeAVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist
}