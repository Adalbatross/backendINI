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
        {content: {filter = {$regex: query, $options:'i'}}}
    }
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}