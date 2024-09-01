import { Router } from "express";
import { getChannelSubscribedTo, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const routes = Router()
routes.use(verifyToken)

routes.route('/:channelId').post(toggleSubscription)
routes.route('/get-subscribers/:channelId').get(getUserChannelSubscribers)
routes.route('/get-channel-list/:channelId').get(getChannelSubscribedTo)



export default routes