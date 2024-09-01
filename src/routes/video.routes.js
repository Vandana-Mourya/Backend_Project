import { Router } from "express";
import { deleteAVideo, getAllVideos, getVideoById, togglePublishStatus, updateVideo, uploadVideo } from "../controllers/video.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()
router.use(verifyToken)

router.route('/get-videos').get(getAllVideos)
router.route('/upload-video').post(upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbnails",
        maxCount: 1
    }
]), uploadVideo)
router.route('/:videoId').get(getVideoById)
router.route('/update-video').patch(upload.fields([
    {
        name: "thumbnails",
        max: 1
    }
]), updateVideo)
router.route('/delete-video').delete(deleteAVideo)
router.route('/toggle/publish/:videoId').patch(togglePublishStatus)
export default router