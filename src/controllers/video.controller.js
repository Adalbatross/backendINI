import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/APiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deletefromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy="createdAt", sortType = "desc", userId }
     = req.query
    const filter = {}; // filter is the object that consists of the criteria for the search
    if(query){         // query ids the keyword by which we search the video by comparisions
        filter.$or = [
            {title : {$regex: query, $options:'i'}},    //regex is used to find the query in the title or the description of the video
            {description : {$regex: query, $options:'i'}} //options is used to denullify the casesensivenesss of the query in the title or the description
        ];
    }
    // else{
    //     throw new ApiError(400, "Failed to get the query")  here we are excluding this as if the user has not provided the query
    // }                                                       we will show all the videos wihout the filter 
    if(userId){
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid user id")
        }
        filter.owner = userId
    }    
    const options = {                       // these are the options for the paginate function so that it recieves some paramaters.
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort:{[sortBy]: sortType === 'asc' ? 1 : -1}
    }
    const videos = await Video.paginate(filter, options);  // this contains an array of the videos recieved by the database and the total number of docs present and the limitand the current page number and
                                                            // and many other things like previous page next page counter and their number
    res
    .status(200)
    .json(new ApiResponse(200, videos, "the videos are extracted successfully"))
    //TODO: get all videos based on query, sort, pagination---> done
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, isPublished } = req.body;
    const userId = req.user?._id;

    if ([title, description, isPublished].some((field) => !field?.trim())) {
        throw new ApiError(400, "The title, description, and isPublished are compulsory");
    }

    const videoLocalPath = req.files?.video?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "The video file is not uploaded correctly");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "The thumbnail file is not uploaded correctly");
    }

    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!video || !video.url || !video.duration) {
        throw new ApiError(400, "The video is required and must have a duration");
    }

    if (!thumbnail || !thumbnail.url) {
        throw new ApiError(400, "The thumbnail is required");
    }

    const newVideo = new Video({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: video.duration,
        isPublished,
        owner: userId // Link video to the user who uploaded it
    });

    await newVideo.save(); // Save the new video instance to the database

    res
        .status(201)
        .json(new ApiResponse(201, newVideo, "The video is uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        const video = await Video.findById(videoId)
        if(!video){
            throw new ApiError(404,"Video not found")
        }
        res
        .status(200)
        .json(new ApiResponse(200,video,"The video was successfully fetched"))
    } catch (error) {
        throw new ApiError(500, "Server was not able to fetch the video")
    }
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const {title, description,thumbnail} = req.body
    if (!title || !description || !thumbnail ) {
        throw new ApiError(400, "All fields are required")
    }

    try {
        const video = await Video.findById(videoId)
        if(!video){
            throw new ApiError(404, "The video was not found")
        }
        if(video.owner.toString()!==req.user._id.toString()){
            throw new ApiError(403, "You are not an authorized user! ")
        }
        const updatedVideo = await Video.findByIdAndUpdate(videoId,
            {title, description,thumbnail},
            {new: true, runValidators:true}
        );
        res.
        status(200)
        .json(new ApiResponse(200, updatedVideo,"The video is updated successfully"))

        
    } catch (error) {
        throw new ApiError(500, error.message)
    }
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found !!")
    }
    const videoUrl= video.videoFile
    const thumbnailUrl = video.thumbnail
    if (!thumbnailUrl) {
        throw new ApiError(400, "Unable to find the thumbnail url")
    }
    else{
        try {
            await deletefromCloudinary(thumbnailUrl)
        } catch (error) {
            throw new ApiError(400, "there was some error is deleting the thumbnail from cloudinary")
        }
    }
    if(!videoUrl){
        throw new ApiError(400,"Unable to find the video url")
    }
    else{
        try {
            await deletefromCloudinary(videoUrl)
        } catch (error) {
            throw new ApiError(400, "There was some error while deleting the video from cloudinary")
        }
    };
    await Video.findByIdAndDelete(videoId);

    res
    .status(200)
    .json(new ApiResponse(200,null,"The video and thumbnail were deleted successfully"))

    
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    else{
        if(video.isPublished === true){
            video.isPublished = false
        }
        else{
            video.isPublished = true
        }
    }
    await video.save
    const status = video.isPublished ? "Video published successfully" : "Video unpublished successfully";
    res
    .status(200)
    .json(new ApiResponse(200,null, status))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}