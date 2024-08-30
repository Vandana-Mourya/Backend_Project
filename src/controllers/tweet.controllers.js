import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiErrors } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const createTweet = asyncHandler(async (req, res) => {
    
    const { content } = req.body

    if(!content){
        throw new ApiErrors(400, "Please add some content in tweet")
    }

    const createContent = await Tweet.create({
        content : content,
        owner : req.user._id
    })

    return res 
    .status(200)
    .json(
        new ApiResponse(200, "Tweet posted successfully!", createContent)
    )
})

const getUsersTweet = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const page = 1, limit = 10, skip = (limit * (page-1))
    const sortOptions = {
        createdAt : 1
    }

    const getTweets = await Tweet.find({owner:userId})
    .skip(skip)
    .limit(limit)
    .sort(sortOptions)
     
    const totalTweets = await Tweet.countDocuments({owner:userId})

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Tweets fetched Successfully!", {getTweets, 
            pagination: {
                totalTweets,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalTweets / limit),
                limit: limit

            }
        })
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { editContent } = req.body

    const tweet = await Tweet.findOneAndUpdate({owner: req.user._id, _id:tweetId}, {
        $set: {
            content:editContent
        }
    },{new: true})

    if(!tweet){
        throw new ApiErrors(400, "You don't have access to edit this tweet, as you're not the owner!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Tweet got updated successfully!", tweet)
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    const delResult = await Tweet.findOneAndDelete({owner: req.user._id, _id:tweetId})

    if(!delResult){
        throw new ApiErrors(400, "You can't delete this post as you're not the owner of this tweet")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, "Tweet deleted successfully!", delResult)
    )
})

export {
    createTweet,
    getUsersTweet,
    updateTweet,
    deleteTweet
}