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


const router = Router()

router.route('/register').post(
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

router.route('/login').post(loginUser)

// secured
router.route('/logout').post(verifyToken, logoutUser)
router.route('/refreshToken').post(refreshAccessToken)
router.route('/change-password').post(verifyToken, changePassword)
router.route('/current-user').get(verifyToken, getCurrentUser)
router.route('/update-user').patch(verifyToken, updateUser)
router.route('/avatar').post(verifyToken, upload.single('avatar'), updateAvatar)
router.route('/coverImage').post(verifyToken, upload.single('coverImage'),updateCoverImage)
router.route('/c/:username').get(verifyToken, getUserChannelProfile)
router.route('/watchHistory').get(verifyToken, getWatchHistory)

export default router