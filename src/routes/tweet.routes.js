import { Router } from "express";
import { createTweet, deleteTweet, getUsersTweet, updateTweet } from "../controllers/tweet.controllers.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const routes = Router()

routes.use(verifyToken)

routes.route('/create/tweet').post(createTweet)
routes.route('/get-tweets/:userId').get(getUsersTweet)
routes.route("/update-tweet/:tweetId").patch(updateTweet)
routes.route("/delete-tweet/:tweetId").delete(deleteTweet)

export default routes