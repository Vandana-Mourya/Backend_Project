import { asyncHandler } from '../utils/asyncHandler.js'
import {ApiErrors} from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'

const generatAceesAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessTokens();
        const refreshToken = user.generateRefreshTokens();
    
        // saving refreshToken in database
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})
    
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiErrors(500, "Something went wront while generating refresh and access tokens", error)
    }
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
    if ([fullName, username, email, password].some((field) => field?.trim() === "")){
        throw new ApiErrors(400, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existingUser){
        throw new ApiErrors(409, "This username or email already exists please try with a different email or username")
    
    }

   
    
    // const coverPhotoPath = req.files?.coverImage[0]?.path
    
    const avatarLocalPath = req.files?.avatar[0]?.path
    console.log(req.files);

    let coverPhotoPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0 ){
        coverPhotoPath = req.files.coverImage[0].path
    }
    console.log(req.files)



    // avatar file is required
    if(!avatarLocalPath){
        throw new ApiErrors(400, "Avatar file is required")
    }
    const coverImage = await uploadOnCloudinary(coverPhotoPath)
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

const loginUser = asyncHandler(async (req, res) => {
    // request body for data
    // get username or email 
    // find the user
    // get the password and check
    // refresh and access token
    // send cookie

    const { username, email, password } = req.body

    console.log(req.body)

    if(!username && !email){
        throw new ApiErrors(400, "username or email is required")
    }
    const user = await User.findOne({
        $or: [{username, email}]
    })
    if(!user){
        throw new ApiErrors(404, "username or email not found")
    }

    const isPasswordValid = user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiErrors(401, "Invalid password please enter the correct password")
    }

    const {accessToken, refreshToken} = await generatAceesAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly : true,
        secure : false,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
       new ApiResponse(200, {User : loggedInUser, accessToken, refreshToken}, "User logged in successfully!")
    )
})


const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(req.user._id,
        {
            refreshToken : undefined,
        },
        {
            new: true,
        }
    )
    const options = {
        httpOnly : true,
        secure: true,
    }
    return res
    .status(200)
    .clearCookie("accessToken", {}, options)
    .clearCookie("refreshToken", {}, options)
    .json( new ApiResponse(200, "User LoggedOut Successfully."))
})


export { registerUser ,
    loginUser,
    logoutUser
}

// bug fixes
/* 
 deletion of files from temporary memory when the user already exists 
 cover image issue resolving
*/
