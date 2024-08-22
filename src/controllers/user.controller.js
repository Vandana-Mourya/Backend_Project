import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiErrors } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

const generatAceesAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessTokens();
        const refreshToken = user.generateRefreshTokens();

        // saving refreshToken in database
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiErrors(500, "Something went wront while generating refresh and access tokens", error)
    }
}
const options = {
    httpOnly: true,
    secure: false,
}


const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend
    // validate - not empty
    // check if user already exists: username, email
    // check for images, check for avatars
    // upload and check for the avatars if it is uploaded on cloudinary or not
    // create user object - create user in db
    // remove password and refresh tokens from database response
    // check for user creation : if not then show error
    // return response

    // registration
    const { fullName, email, password, username } = req.body
    console.log((req.body));

    // vallidation
    if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiErrors(400, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        throw new ApiErrors(409, "This username or email already exists please try with a different email or username")

    }



    // const coverPhotoPath = req.files?.coverImage[0]?.path

    const coverImageLocalPath = req.files?.avatar[0]?.path
    console.log(req.files);

    let coverPhotoPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverPhotoPath = req.files.coverImage[0].path
    }
    console.log(req.files)



    // avatar file is required
    if (!avatarLocalPath) {
        throw new ApiErrors(400, "Avatar file is required")
    }
    const coverImage = await uploadOnCloudinary(coverPhotoPath)
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar) {
        throw new ApiErrors(400, "Avatar file is required")

    }


    const user = await User.create({
        fullName,
        email,
        coverImage: coverImage?.url || "",
        avatar: avatar.url,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiErrors("Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, "User registered successfully", createdUser)
    )
})

const loginUser = asyncHandler(async (req, res) => {
    // request body for data
    // get username or email 
    // find the user
    // get the password and check
    // refresh and access token
    // send cookie

    const { username, email, password } = req.body

    console.log(req.body)

    if (!username && !email) {
        throw new ApiErrors(400, "username or email is required")
    }
    const user = await User.findOne({
        $or: [{ username, email }]
    })
    if (!user) {
        throw new ApiErrors(404, "username or email not found")
    }

    const isPasswordValid = user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiErrors(401, "Invalid password please enter the correct password")
    }

    const { accessToken, refreshToken } = await generatAceesAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { User: loggedInUser, accessToken, refreshToken }, "User logged in successfully!")
        )
})


const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(req.user._id,
        {
            // $unset:{
            //     refreshToken ; 1  //  this removes the field from the documents
            // },
            refreshToken: undefined,
        },
        {
            new: true,
        }
    )

    return res
        .status(200)
        .clearCookie("accessToken", {}, options)
        .clearCookie("refreshToken", {}, options)
        .json(new ApiResponse(200, "User LoggedOut Successfully."))
})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiErrors(400, "Unauthorised Access")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiErrors(401, "Inavlid access Token")
        }

        if (incomingRefreshToken !== decodedToken) {
            throw new ApiErrors(401, "Refresh Token expired or used")
        }
        const { accessToken, newRefreshToken } = generatAceesAndRefreshTokens(user._id)

        return res.json(
            new ApiResponse(200, "access Token refreshed", { accessToken, newRefreshToken })
        )
    } catch (error) {
        throw new ApiErrors(401, error?.message || "Invalid refresh Token")
    }
})

const changePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)

    const isPassworedValid = await user.isPasswordCorrect(newPassword)

    if (!isPassworedValid) {
        throw new ApiErrors(400, "Invalid Password")
    }

    user.password = newPassword
    user.save(validateBeforeSave = false)

    res
        .status(200)
        .json(new ApiResponse(200, "Password Changed Successfully!", {}))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, "Current User fetched Successfully", req.user))
})

const updateUser = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiErrors(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName,
            email: email,  // we can do this by both ways
        }
    },
        { new: true }).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, "Information Updated Successfully", user))
})

const updateAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiErrors(400, "Avatar File is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar?.url) {
        throw new ApiErrors(500, "Something went wront while uploading on cloudinary")
    }

    const user = User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar.url
        }
    }, { new: true }).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Avatar image updated successfully", user)
        )

})

const updateCoverImage = asyncHandler(async (req, res) => {

    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiErrors(400, "Cover Image File is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage?.url) {
        throw new ApiErrors(500, "Something went wront while uploading on cloudinary")
    }

    const user = User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverImage: coverImage.url
        }
    }, { new: true }).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Cover Image updated successfully", user)
        )

})

const getUserChannelProfile = asyncHandler(async (req, res) => {

    const { username } = req.params

    if (!username?.trim()) {
        throw new ApiErrors(400, "username is not present")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                SubscribersCount: {
                    $size: "$subscribers"
                },
                ChannelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subcribers.subscriber"] },
                        then: true,
                        else: false,
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                SubscribersCount: 1,
                ChannelSubscribedToCount: 1,
                isSubscribed: 1,
            }
        }
    ])
    if (!channel?.length) {
        throw new ApiErrors(400, "Channel does not exists")
    }

    return res
        .status(200)
        .json(new ApiResponse(100, "Channel detailes fetched successfully!", channel[0]))
})

const getWatchHistory = asyncHandler(async (req, res) => {

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignFieldField: "-id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "watchHistory",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                },
                            ]
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Watch History fetched Successfully!", user[0].watchHistory)
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateUser,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory

}

// bug fixes
/* 
 deletion of files from temporary memory when the user already exists 
 cover image issue resolving
*/
