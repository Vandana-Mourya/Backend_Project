import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs' // fs => file system directly access from node.js 
import { User } from '../models/user.model.js';

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//duplicate entries checking and deleting the file and
// file uploading


const uploadOnCloudinary = async function(localFilePath){
    try {

        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        //file has been uploaded successfully

        console.log("file has been uploaded successfully", response.url);
        return response;
        

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed.
        return null
    }
}

export {uploadOnCloudinary}