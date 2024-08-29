import { Router } from "express";
import { deleteAVideo, getAllVideos, getVideoById, togglePublishStatus, updateVideo, uploadVideo } from "../controllers/video.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const routes = Router()
routes.use(verifyToken)

routes.route('/get-videos').get(getAllVideos)
routes.route('/upload-video').post(upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbnails",
        maxCount: 1
    }
]), uploadVideo)
routes.route('/:videoId').get(getVideoById)
routes.route('/update-video').patch(upload.fields([
    {
        name: "thumbnails",
        max: 1
    }
]), updateVideo)
routes.route('/delete-video').delete(deleteAVideo)
routes.route('/toggle/publish/:videoId').patch(togglePublishStatus)
export default routes