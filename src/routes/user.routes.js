import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyToken } from "../middlewares/auth.middleware.js";


const routes = Router()

routes.route('/register').post(
    upload.fields([
        {
            name: "coverImage",
            maxCount: 1
        },
        {
            name: "avatar",
            maxCount: 1
        },
    ]),
    registerUser)

routes.route('/login').post(loginUser)

// secured
routes.route('/logout').post(verifyToken, logoutUser)
routes.route('/refreshToken').post(refreshAccessToken)

export default routes