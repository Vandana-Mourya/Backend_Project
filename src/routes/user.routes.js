import { Router } from "express";
import { changePassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAvatar, 
    updateCoverImage, 
    updateUser
 } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyToken } from "../middlewares/auth.middleware.js";
import { verify } from "jsonwebtoken";


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
routes.route('/change-password').post(verifyToken, changePassword)
routes.route('/current-user').get(verifyToken, getCurrentUser)
routes.route('/update-user').patch(verifyToken, updateUser)
routes.route('/avatar').post(verifyToken, upload.single('avatar'), updateAvatar)
routes.route('/coverImage').post(verifyToken, upload.single('coverImage'),updateCoverImage)
routes.route('/c/:username').get(verifyToken, getUserChannelProfile)
routes.route('/watchHistory').get(verifyToken, getWatchHistory)

export default routes