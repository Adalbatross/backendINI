import mongoose, {isValidObjectId} from "mongoose"
import {Likes,Video,Tweet,Comment} from "../models/like.model.js"
import {ApiError} from "../utils/APiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user._id

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Unable to find the video!")
    }

    const like  = await Likes.findOne({videos:videoId, likedBy: userId})
    let message; 

    if(like){
        await Likes.deleteOne({videos: videoId, likedBy: userId})
        message = "Like was removed"
        
    }
    else{
        await Likes.create({
            videos:videoId,
            likedBy: userId
        })
        message = "Video was liked"


    }
    const likeCount = await Likes.aggregate([
        {$match:{videos: videoId}},
        {$count: "likesCount"}
    ])

    const updatedLikesCount  = likeCount.length > 0 ? likeCount[0].likesCount : 0

    res
    .status(200)
    .json(new ApiResponse(200,updatedLikesCount,message))
    //TODO: toggle like on video
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"Unable to find the comment!")
    }

    const like  = await Likes.findOne({comment:commentId, likedBy: userId})
    let message; 

    if(like){
        await Likes.deleteOne({comment: commentId, likedBy: userId})
        message = "Like was removed"
        
    }
    else{
        await Likes.create({
            comment:commentId,
            likedBy: userId
        })
        message = "Comment was liked"


    }
    const likeCount = await Likes.aggregate([
        {$match:{comment:commentId}},
        {$count: "likesCount"}
    ])

    const updatedLikesCount  = likeCount.length > 0 ? likeCount[0].likesCount : 0

    res
    .status(200)
    .json(new ApiResponse(200,updatedLikesCount,message))
    
    //TODO: toggle like on comment
})



const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    
    const userId = req.user._id

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"Unable to find the tweet!")
    }

    const like  = await Likes.findOne({tweet:tweetId, likedBy: userId})
    let message; 

    if(like){
        await Likes.deleteOne({tweet: tweetId, likedBy: userId})
        message = "Like was removed"
        
    }
    else{
        await Likes.create({
            tweet:tweetId,
            likedBy: userId
        })
        message = "Tweet was liked"


    }
    const likeCount = await Likes.aggregate([
        {$match:{tweet:tweetId}},
        {$count: "likesCount"}
    ])

    const updatedLikesCount  = likeCount.length > 0 ? likeCount[0].likesCount : 0

    res
    .status(200)
    .json(new ApiResponse(200,updatedLikesCount,message))
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const likedVideo = await Likes.aggregate([
        {$match:{
            likedBy: mongoose.Types.ObjectId(userId)
        }},
        {
            $lookup: {
                from: "videos",           // Collection name in MongoDB for videos
                localField: "videos",     // Field in the Likes documents referencing a video
                foreignField: "_id",      // Field in the Video collection
                as: "videoDetails"        // Name of the array to store the joined video documents
            }
            
        },
        { $unwind: "$videoDetails" },
        // 4. Project only the video details (customize this projection as needed)
        
            {
                $project: {
                    _id: 1,                     // Include video ID
                    title: 1,                   // Include video title
                    description: 1,             // Include video description
                    videoFile: 1,               // Include video file URL
                    thumbnail: 1,               // Include thumbnail URL
                    duration: 1,                // Include video duration
                    views: 1,                   // Include number of views
                    isPublished: 1,             // Include publication status
                    owner: 1,                   // Include the owner's ID
                    createdAt: 1,               // Include creation timestamp
                    updatedAt: 1                // Include update timestamp
                }
            }
            
        
    ])
    if(likedVideo.length == 0){
        throw new ApiError(400,"No liked video found")
    }

    res
    .status(200)
    .json(new ApiResponse(200,likedVideo,"The videos were fetched successfully!"))
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}