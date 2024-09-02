import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiErrors } from '../utils/ApiError.js'
import { Subscription } from '../models/subscriptions.model.js'
import { Like } from '../models/like.model.js'
import { Video } from '../models/video.model.js'

const getChannelStats = asyncHandler(async (req, res) => {
    
    const user = {
        fullName: req.user.fullName,
        username: req.user.username,
        avatar: req.user.avatar,
        coverImage: req.user.coverImage
    }
    const videosCount = await Video.countDocuments({ owner: req.user._id })

    const subscribersCount = await Subscription.countDocuments({ channel: req.user._id })

    const allVideos = await Video.find({ owner: req.user._id })

    const allViews = allVideos.map(video => video.views)
    let countViews = 0;
    for (const views of allViews) {
        countViews += views;
    }

    let count=0;
    for (let i = 0; i < allVideos.length; i++) {
       let likesCount = await Like.countDocuments({ video: allVideos[i]._id })
        count += likesCount
    }


    return res
        .status(200)
        .json(
            new ApiResponse(200, "DashBoard", {
                user,
                TotalSubscriber: subscribersCount,
                TotalVideos: videosCount,
                TotalLikesOnChannel: count,
                TotalViews: countViews
            })
        )


})

const getAllVideos = asyncHandler(async (req, res) => {

    const videos = await Video.find({ owner: req.user._id })

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Here are the videos: ", videos)
        )
})

export {
    getAllVideos,
    getChannelStats
}