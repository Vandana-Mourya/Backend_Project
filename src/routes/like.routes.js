import { Router } from "express";
import { verifyToken } from '../middlewares/auth.middleware.js'
import { getLikedVideo, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router()
router.use(verifyToken)

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route('/get-liked-videos').get(getLikedVideo)

export default router