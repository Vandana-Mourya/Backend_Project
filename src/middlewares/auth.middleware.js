import { User } from "../models/user.model.js";
import { ApiErrors } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken'
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyToken = asyncHandler(async(req, res, next) =>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!token){
            throw new ApiErrors(401, "Unauthorised Access")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiErrors(401, "Invalid Access Token")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiErrors(401, error?.message || "Invalid Access Token")
    }
})