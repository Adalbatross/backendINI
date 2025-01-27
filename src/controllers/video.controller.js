import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/APiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


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
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}