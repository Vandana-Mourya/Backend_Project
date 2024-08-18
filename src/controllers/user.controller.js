import { asyncHandler } from '../utils/asyncHandler.js'
import {ApiErrors} from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'

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
    if ([fullName, username, email, password].some((field) => field?.trim() === "")){
        throw new ApiErrors(400, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existingUser){
        throw new ApiErrors(409, "This username or email already exists please try with a different email or username")
    }

   
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path
    
    const coverImageLocalPath = req?.files?.coverImage[0]?.path
    console.log(req.files)


    // let coverImageLocalPath;
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0 ){
    //     coverImageLocalPath = req.files.coverImage[0].path
    // }

    // avatar file is required
    if(!avatarLocalPath){
        throw new ApiErrors(400, "Avatar file is required")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar){
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

    if(!createdUser){
        throw new ApiErrors("Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, "User registered successfully", createdUser)
    )
    
})



export { registerUser }