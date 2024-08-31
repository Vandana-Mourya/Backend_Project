import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";


const createComment = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    const { content } = req.body

    if(!(videoId || content)){
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

export {
    createComment,

}