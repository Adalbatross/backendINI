import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/APiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    const userId = req.user?._id

    if (!content || content.trim() === ""){
        throw new ApiError(400, "The tweet cannot be empty")
    }
    if(!userId){
        throw new ApiError(404, "User not found")
    }
    const tweet = await Tweet.create({
        content,
        owner:userId
    })
    res
    .status(200)
    .json(new ApiResponse(201,tweet,"The tweet was created successfully!"))
    //TODO: create tweet
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy="createdAt", sortType = "desc", userId }
     = req.query
    const filter = {}
    if(query){
        filter.content = {$regex: query, $options:'i'}
    }
    if (userId) {
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid user ID format")
        }
        filter.owner = userId;
    }
    const options = {                       // these are the options for the paginate function so that it recieves some paramaters.
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort:{[sortBy]: sortType === 'asc' ? 1 : -1}
    }

    const tweets = await Tweet.paginate(filter,options)

    res
    .status(200)
    .json(new ApiResponse(200,tweets,"The tweets were fetched successfully"))
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res,next) => {
    const { tweetsID } = req.params
    const { content } = req.body
    const userID = req.user._id
    try {
        if(!content){
            throw new ApiError(400, "Content field is compulsory")
        }

        const tweet = await Tweet.findById(tweetsID)
        if (!tweet) {
            throw new ApiError(400,"Unable to find the tweet")
        }
        if (tweet.owner.toString() !== userID.toString()) {
            throw new ApiError(403,"You are not authorized to edit the tweet")
        }
        if (tweet.content == content) {
            throw new ApiError(400,"The updated content is same as the earlier content")
        }

        const updatedTweet = await Tweet.findByIdAndUpdate(tweetsID,
            {content},
            {new: true, runValidators: true}
        )
    
        res.
        status(200)
        .json(new ApiResponse(200,updatedTweet,"The tweet was updated successfully"))
    } catch (error) {
        next(error); // gives it to the global error handler
    }
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetsID } = req.params
    const userId = req.user._id
    const tweet = await Tweet.findById(tweetsID)
    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }
    if(tweet.owner.toString() !== userId.toString()){
        throw new ApiError(403, "You are not authorized to delete the tweet")
    }
    await Tweet.findByIdAndDelete(tweetsID);
    res.
    status(200)
    .json(new ApiResponse(200,null,"The Tweet was deleted successfully"))


    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}