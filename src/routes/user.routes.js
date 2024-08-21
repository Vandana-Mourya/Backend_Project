import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
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

routes.route('/logout').post(verifyToken, logoutUser)

export default routes