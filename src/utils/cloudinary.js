import {v2 as cloudinary} from 'cloudinary'
import fs from "fs"
import {ApiError} from "./APiError.js"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,

});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null 
            //upload the file in cloudinary
        }
        const response  = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        // file is uplooaded successfully
        // console.log("the file has been uploaded successfully on cloudinary",
            // response.url);
            fs.unlinkSync(localFilePath)
            return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // removes the locally saved temp files as the upload 
        // operation takes place
        return null;
    }
}

const deletefromCloudinary = async(imageUrl)=>{
    try {
        if(!imageUrl){
            throw new ApiError(400,"Image url is missing")
        }
    
        const publicId = imageUrl.split('/').pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId)
        console.log("Image deleted successfully")
    } catch (error) {
        throw new ApiError(500, "Something went wrong while deleting the image")
    }
}

export {uploadOnCloudinary, deletefromCloudinary}