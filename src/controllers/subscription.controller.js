import mongoose from "mongoose";
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiErrors } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Subscription } from "../models/subscriptions.model.js";
import { User } from '../models/user.model.js'

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    try {
        const channelExists = await User.findById(channelId)
        if (!channelExists) {
            throw new ApiResponse(400, "No channel Found.")
        }

        const isSubscribed = await Subscription.findOne({ channel: channelId, subscriber: req.user._id })
        console.log(isSubscribed)

        if (isSubscribed) {
            const remove = await Subscription.findOneAndDelete({channel: channelId, subscriber: req.user._id })

            return res
                .status(200)
                .json(
                    new ApiResponse(200, "Unsubscribed Successfully", {
                        remove,
                        Subscribed: false
                    })
                )
        }
        else {
            const addSubscriber = await Subscription.create({
                subscriber: req.user._id,
                channel: channelId
            })

            return res
                .status(200)
                .json(
                    new ApiResponse(200, "Subscribed Successfully", {
                        Subscribed: true,
                        addSubscriber
                    })
                )
        }
    } catch (error) {
        throw new ApiErrors(500, "Something went wrong! :)")
    }


})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const getSubscribers = await Subscription.find({ channel: channelId })

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Subcriber Details for this channel", getSubscribers)
        )

})

const getChannelSubscribedTo = asyncHandler(async(req, res) => {
    const { channelId } = req.params

    const getChannelList = await Subscription.find({subscriber:channelId})

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Subscribed Channels Details:", getChannelList)
    )
})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getChannelSubscribedTo
}