import { v2 as cloudinary } from 'cloudinary'
import { log } from 'console';
import fs from 'fs' // fs => file system directly access from node.js 

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// file uploading

const uploadOnCloudinary = async function(localFilePath){
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded successfully

        console.log("file has been uploaded successfully", response.url);
        return response;
        

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed.
        return null
    }
}

export {uploadOnCloudinary}