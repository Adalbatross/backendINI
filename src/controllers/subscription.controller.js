import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/APiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const subscriberId = req.user._id
    if(!subscriberId){
        throw new ApiError(400, "There was some error in subscriber ID")
    }
    const existingSubscriber = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })
    let message;
    if(existingSubscriber){
        await Subscription.findByIdAndDelete(existingSubscriber._id)
        message = "The channel was unsubscribed!"
    }
    else{
         await Subscription.create({
            subscriber: subscriberId,
            channel: channelId
        })    
        message = "The channel was subscribed!"   
        
    }
    res
    .status(200)
    .json(new ApiResponse(200,null,message))

    
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const channelSubscribers = await Subscription.aggregate([
        { $match: { channel: mongoose.Types.ObjectId(channelId) } },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $unwind: "$subscriberDetails"
        },
        {
            $project: {
                _id: 0,
                subscriberId: "$subscriberDetails._id",
                subscriberName: "$subscriberDetails.fullName",
                subscriberEmail: "$subscriberDetails.email",
                subscribedAt: "$createdAt"
            }
        }
    ]);

    if (!channelSubscribers.length) {
        throw new ApiError(404, "No subscribers found for this channel");
    }

    res
    .status(200)
    .json(new ApiResponse(200, channelSubscribers, "Subscribers fetched successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const subscribedChannel = await ChannelMergerNode.aggregate([
        {$match:{channel: mongoose.Types.ObjectId(subscriberId)}},
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channelDetails"
                
            }
        },
        {
            $unwind:"$channelDetails"
        },
        {
            $project:{
                _id: 0,
                channelId:"$channelDetails.id",
                channelName: "$channelDetails.username",
                channelEmail: "$channelDetails.email",
                subscribedAt: "$createdAt"
            }
        }
    ])
    if(!subscribedChannel.length){
        throw new ApiError(404,"No subscribed channel found")
    }
    res
    .status(200)
    .json(new ApiResponse(200,subscribedChannel,"The subscribed channel were fetched!"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}