import mongoose from 'mongoose'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiErrors } from '../utils/ApiError.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { Video } from '../models/video.model.js'

const getAllVideos = asyncHandler(async (req, res) => {
    console.log(req.body);
    try {
        const { page = 1, query = "", sortBy = "createdAt", sortType = "asc", limit = 10, userId } = req.query;

        if (!userId) {
            console.log("userId not provided");
        }

        // Searching
        let searchQuery = {};
        console.log("Query Parameter:", query); // Ensure this shows the search term you're expecting

        if (query) {
            searchQuery = {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },

                ]
            };
        }
        
        console.log("Search Query:", JSON.stringify(searchQuery, null, 2));


        if (userId) {
            searchQuery.userId = userId;
        }

        // Sorting
        let sortOptions = {};
        sortOptions[sortBy] = sortType === "asc" ? 1 : -1;
        console.log("Sorting Passed");

        // Pagination
        const skip = (page - 1) * limit;
        const videoLimit = parseInt(limit);
        const getVideos = await Video.find(searchQuery)
            .skip(skip)
            .limit(videoLimit)
            .sort(sortOptions);

        console.log("Pagination Passed");

        // Total video documents
        const totalVideos = await Video.countDocuments(searchQuery);

        console.log("Response Issue");

        let notFound;
        if (getVideos.length === 0) {
            notFound = "Video not found";
        } else {
            notFound = "Videos fetched successfully";
        }

        return res.status(200).json(
            new ApiResponse(200, notFound, {
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
    console.log(req.body)
    const { title, description } = req.body

    const videoLocalPath = req.files?.videoFile[0].path
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
    })
    console.log(video)

    return res.status(200)
        .json(
            new ApiResponse(200, "Video uploaded Successfully!", {
                video,
                Title: title,
                Description: description,
                Video: videoUploading.url,
                Thumbnails: thumbnailUploading.url
            })
        )
})

export {
    getAllVideos,
    uploadVideo,
}