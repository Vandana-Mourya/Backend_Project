import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiErrors } from '../utils/ApiError.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { Video } from '../models/video.model.js'

const getAllVideos = asyncHandler(async (req, res) => {
    try {
        const { page = 1, query = "", sortBy = "createdAt", sortType = "asc", limit = 10, userId } = req.query;

        if (!userId) {
            console.log("userId not provided");
        }

        // Searching
        let searchQuery = {};
        if (query) {
            searchQuery = {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },

                ]
            };
        }

        if (userId) {
            searchQuery.owner = userId;
        }

        // Sorting
        let sortOptions = {};
        sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

        // Pagination
        const skip = (page - 1) * limit;
        const videoLimit = parseInt(limit);
        const getVideos = await Video.find(searchQuery)
            .skip(skip)
            .limit(videoLimit)
            .sort(sortOptions);

        // Total video documents
        const totalVideos = await Video.countDocuments(searchQuery);

        let foundStatus;
        if (getVideos.length === 0) {
            foundStatus = "Video not found";
        } else {
            foundStatus = "Videos fetched successfully";
        }

        return res.status(200).json(
            new ApiResponse(200, foundStatus, {
                getVideos,
                pagination: {
                    totalVideos,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalVideos / limit),
                    limit: videoLimit
                }
            })
        );
    } catch (error) {
        throw new ApiErrors(500, "Something went wrong while fetching the videos.");
    }
});


const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    console.log(req.body)

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnails[0].path

    if (!(title || description)) {
        throw new ApiErrors(400, "Please add Title and description of the video")
    }

    if (!videoLocalPath) {
        throw new ApiErrors(400, "Please upload a video.")
    }
    if (!thumbnailLocalPath) {
        throw new ApiErrors(400, "Thumbnail is required.")
    }

    const videoUploading = await uploadOnCloudinary(videoLocalPath)
    const thumbnailUploading = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoUploading?.url) {
        throw new ApiErrors(500, "Couldn't upload on server, Something went wrong while uploading the video")
    }
    if (!thumbnailUploading?.url) {
        throw new ApiErrors(500, "Something went wrong while uploading thumbnail on the server")
    }

    const video = await Video.create({
        title: title,
        description: description,
        videoFile: videoUploading.url,
        thumbnails: thumbnailUploading.url,
        owner : req.user._id
    })

    console.log(video)

    return res.status(200)
        .json(
            new ApiResponse(200, "Video uploaded Successfully!", {
                video,
                Title: title,
                Description: description,
                Video: videoUploading.url,
                Thumbnails: thumbnailUploading.url,
            })
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const videoDetails = await Video.findById(videoId).select(" -isPublished -createdAt -updatedAt -views")

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Video fetched Successfully", videoDetails)
        )
})

const updateVideo = asyncHandler(async (req, res) => {

    const { title, description, videoId } = req.body
    console.log(req.body)

    if (!title || !description) {
        throw new ApiErrors(400, "All fields are required")
    }
    console.log(title, description);


    const thumbnailLocalPath = req.files.thumbnails[0].path
    console.log(thumbnailLocalPath);


    const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    console.log(uploadThumbnail);


    const videoLink = await Video.findOneAndUpdate({_id: videoId, owner: req.user._id}, {
        $set: {
            title: title,
            description: description,
            thumbnails: uploadThumbnail.url
        }
    }, { new: true })

    if(!videoLink){
        throw new ApiErrors(400, "You are not an authorized person to make changes.")
    }

    console.log(videoLink);


    return res
        .status(200)
        .json(
            new ApiResponse(200, "Details get updated Successfully!", videoLink)
        )

})

const deleteAVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    const result = await Video.findOneAndDelete({_id: videoId, owner: req.user._id})
    
    if(!result){   
        throw new ApiErrors(400, "You can't delete this video as you're not the owner of this video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Video deleted successfully!", result)
    )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const publishStatus = await Video.findOneAndUpdate({_id: videoId, owner: req.user._id}, 
       [
        {
            $set: {
                isPublished: {
                    $cond: {
                        if: { $eq :["$isPublished" , true]},
                        then: false,
                        else : true
                    }
                }
            }
        }
       ], {new : true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Publish status changed Successfully!", publishStatus)
    )
})

const videoViews = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    
    const video = await Video.findById(videoId)
    console.log(video)
    if(!video){
        throw new ApiErrors(400, "Video not found!")
    }

    if(!(video.owner.toString() === req.user._id.toString())){
    video.views += 1;
    }
    await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Video viewed", {
            video,
            views:video.view
        })
    )


})

export {
    getAllVideos,
    uploadVideo,
    getVideoById,
    updateVideo,
    deleteAVideo,
    togglePublishStatus,
    videoViews
}