import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/APiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const totalVideos = await Video.countDocuments({ owner:userId }); // using the countdocument query to get the number of documents where the owner is userId
    const totalSubscribers = await Subscription.countDocuments({ channel: userId});
    const videoStats = await Video.aggregate([
        {
            $match:{owner:mongoose.Types.ObjectId(userId)}
        },
        {
            $group:{
                _id:null,
                totalViews:{
                    $sum:"$views"
                }
            }
        }
    ])
    const totalViews = videoStats.length > 0 ? videoStats[0].totalViews : 0;
    const likeStats = await Like.aggregate([
        {
            $lookup: {
                from: "videos", // Reference Video collection
                localField: "videoId", // Field in Like collection
                foreignField: "_id", // Field in Video collection
                as: "video"
            }
        },
        {
            $match: { "video.owner": mongoose.Types.ObjectId(userId) }
        },
        {
            $group: {
                _id: null,
                totalLikes: {
                    $sum: 1
                }
            }
        }
    ]);

    const totalLikes = likeStats.length > 0 ? likeStats[0].totalLikes : 0;

    res.status(200).json(new ApiResponse(200, {
        totalVideos,
        totalSubscribers,
        totalViews,
        totalLikes
    }, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { page=1, limit=10} = req.query
    const userId = req.user._id
    
    const options = {
        page : parseInt(page),
        limit : parseInt(limit),
        sort : {createdAt:-1}
    };
    const videos = await Video.paginate({owner:userId},options)

    if(videos.docs.length===0){
        throw new ApiError(404,"No videos uploaded by the user")
    }
    res
    .status(200)
    .json(new ApiResponse(200, {
        videos: videos.docs,
        totalVideos: videos.totalDocs,
        totalPages: videos.totalPages,
        currentPage: videos.page
    },"The videos were fetched successfully")) 

    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }