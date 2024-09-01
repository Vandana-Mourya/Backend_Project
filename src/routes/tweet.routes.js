import { Router } from "express";
import { createTweet, deleteTweet, getUsersTweet, updateTweet } from "../controllers/tweet.controllers.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyToken)

router.route('/create/tweet').post(createTweet)
router.route('/get-tweets/:userId').get(getUsersTweet)
router.route("/update-tweet/:tweetId").patch(updateTweet)
router.route("/delete-tweet/:tweetId").delete(deleteTweet)

export default router