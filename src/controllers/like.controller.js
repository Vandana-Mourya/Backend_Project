import mongoose from "mongoose";
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiErrors } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Video } from '../models/video.model.js'
import { Tweet } from '../models/tweet.model.js'
import { Comment } from '../models/comment.model.js'
import { Like } from "../models/like.model.js";

const toggleVideoLike = asyncHandler(async(req, res) => {
    const { videoId } = req.params

    const videoExists = await Video.findById(videoId)

    if(!videoExists){
        throw new ApiErrors(400, "Video not found!")
    }

    const isLiked = await Like.findOne({video:videoId})

    if(isLiked){

        const remove = await Like.findOneAndDelete({_id:isLiked._id})

        return res
        .status(200)
        .json(
            new ApiResponse(200, "Like removed!", remove)
        )
    }
    else{
        const addLike = await Like.create({video:videoId, likedBy:req.user._id})
        return res
        .status(200)
        .json(
            new ApiResponse(200, "Video liked!", addLike)
        )
    }
})

const toggleTweetLike = asyncHandler(async(req, res) => {
    const { tweetId } = req.params

    const tweetExists = await Tweet.findById(tweetId)

    if(!tweetExists){
        throw new ApiErrors(400, "Tweet not found!")
    }

    const isLiked = await Like.findOne({tweet:tweetId})

    if(isLiked){

        const remove = await Like.findOneAndDelete({_id:isLiked._id})

        return res
        .status(200)
        .json(
            new ApiResponse(200, "Like removed!", remove)
        )
    }
    else{
        const addLike = await Like.create({tweet:tweetId, likedBy: req.user._id})
        return res
        .status(200)
        .json(
            new ApiResponse(200, "Tweet liked!", addLike)
        )
    }
})

const toggleCommentLike = asyncHandler(async(req, res) => {
    const { commentId } = req.params

    const commentExists = await Comment.findById(commentId)

    if(!commentExists){
        throw new ApiErrors(400, "Comment not found!")
    }

    const isLiked = await Like.findOne({comment:commentId})

    if(isLiked){

        const remove = await Like.findByIdAndDelete(isLiked._id)

        return res
        .status(200)
        .json(
            new ApiResponse(200, "Like removed!", remove)
        )
    }
    else{
        const addLike = await Like.create({comment:commentId, likedBy : req.user._id})
        return res
        .status(200)
        .json(
            new ApiResponse(200, "Comment liked!", addLike)
        )
    }
})

const getLikedVideo = asyncHandler(async(req, res) => {
    const list = await Like.find({likedBy:req.user._id, video:{$exists:true}}).populate('video')

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Liked Videos: ", list)
    )
})


export {
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    getLikedVideo
}