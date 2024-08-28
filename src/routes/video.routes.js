import { Router } from "express";
import { getAllVideos, uploadVideo } from "../controllers/video.controller.js";
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

export default routes