import mongoose, { connect } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";


const createComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body

    if (!(videoId || content)) {
        throw new ApiErrors(400, "videoId and content is required to post a comment")
    }

    const comment = await Comment.create({
        content,
        owner: req.user._id,
        video: videoId
    })


    return res
        .status(200)
        .json(
            new ApiResponse(200, "Comment posted Successfully!", comment)
        )
})

const getAllComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const page = 1, limit = 10

    const getComments = await Comment.find({ video: videoId })
    .skip((page-1)*limit)
    .limit(limit)

    const totalComments = await Comment.countDocuments({video:videoId})

    if (getComments.length === 0) {
        throw new ApiErrors(200, "No comments found on this video!")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Here are the comments...", {getComments, 
                pagination:{
                    totalComments : totalComments,
                    currentPage : page,
                    totalPages: Math.ceil(totalComments/limit)
                }
            })
        )
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    if (!content) {
        throw new ApiErrors(400, "Please provide some content!")
    }

    const update = await Comment.findOneAndUpdate({owner: req.user._id, _id:commentId}, {
        $set: {
            content:content
        }
    })

    if(!update){
        throw new ApiErrors(400, "Either the comment not found or You aren't the owner of the comment.")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Comment updated succesfully!", update)
    )
})

const deleteComment = asyncHandler(async(req, res) => {
    const { commentId } = req.params

    const delComment = await Comment.findOneAndDelete({owner:req.user._id, _id: commentId})

    if(!delComment){
        throw new ApiErrors(400, "Either comment not found or you are not the owner of the comment.")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Comment deleted Successfully!", delComment)
    )
})


export {
    createComment,
    getAllComments,
    updateComment,
    deleteComment
}