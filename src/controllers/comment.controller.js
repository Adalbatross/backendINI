import mongoose from "mongoose"
import {Comment,Video} from "../models/comment.model.js"
import {ApiError} from "../utils/APiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

   
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Unable to find the video");
    }

  
    const comments = await Comment.aggregate([
        {
            $match: { video: mongoose.Types.ObjectId(videoId) } // Filter comments by video ID
        },
        {
            $lookup: {
                from: "users",         // Collection to join with (Users collection)
                localField: "owner",   // Field in Comment schema
                foreignField: "_id",   // Field in User schema
                as: "ownerDetails"     // Output array name
            }
        },
        {
            $unwind: "$ownerDetails"  // Convert array into an object
        },
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                "ownerDetails._id": 1,
                "ownerDetails.username": 1,
                "ownerDetails.avatar": 1
            }
        },
        {
            $sort: { createdAt: -1 }  // Sort comments by newest first
        },
        {
            $skip: (parseInt(page) - 1) * parseInt(limit)  // Skip based on pagination
        },
        {
            $limit: parseInt(limit)  // Limit number of comments per page
        }
    ]);

    
    res
    .status(200)
    .json(new ApiResponse(200,comments,"The comments were fetched successfully"));
});


const addComment = asyncHandler(async (req, res) => {
    const { videoId }  = req.params;
    const userId = req.user._id;
    const { content } = req.body;
    if(!content){
        throw new ApiError(400, "Content field is required")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Unable to find the video")
    }
    const comment = await Comment.create({
        video:videoId,
        owner:userId,
        content
    }   
    )
    res
    .status(200)
    .json(new ApiResponse(200,comment,"The comment was created successfully"))
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    const { commentId } = req.params
    const userId = req.user._id
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "Unable to find the comment")
    }
    if(!content){
        throw new ApiError(400,"Content field is required")
    }
    if(comment.owner.toString() !== userId.toString()){
        throw new ApiError(403,"Authentication error!")
    }
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {content},
        {new: true}
    )
    res
    .status(200)
    .json(new ApiResponse(200,updatedComment, "The comment was updated successfully! "))
    
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user._id
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"Unable to find the comment")
    }
    if(comment.owner.toString() !== userId.toString()){
        throw new ApiError(403,"Authentication error!")
    }
    await Comment.findByIdAndDelete(commentId)

    res
    .status(200)
    .json(new ApiResponse(200,null,"The comment was deleted successfully!"))
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }