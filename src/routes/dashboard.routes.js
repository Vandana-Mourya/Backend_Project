import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getAllVideos, getChannelStats } from "../controllers/dashboard.controller.js";

const router = Router()
router.use(verifyToken)

router.route('/get-all-videos').get(getAllVideos)
router.route('/get-channel-stats').get(getChannelStats)

export default router