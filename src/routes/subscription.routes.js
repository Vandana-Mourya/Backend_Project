import { Router } from "express";
import { getChannelSubscribedTo, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyToken)

router.route('/:channelId').post(toggleSubscription)
router.route('/get-subscribers/:channelId').get(getUserChannelSubscribers)
router.route('/get-channel-list/:channelId').get(getChannelSubscribedTo)



export default router