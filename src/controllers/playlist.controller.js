import mongoose, {isValidObjectId} from "mongoose"
import {Playlist,Video} from "../models/playlist.model.js"
import {ApiError} from "../utils/APiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description,videos=[]} = req.body
    const userId = req.user?._id
    if (
        [name, description].some((field)=> 
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are compulsory")
    }
    if(videos.length>0){
        const existingVideos = await Video.find({_id:{$in: videos }}).select("_id")
        const validVideoIds = existingVideos.map(video => video._id.toString());
        if (videos.length !== validVideoIds.length){
            throw new ApiError(400, "Some provided video IDs are invalid")
        }
    }

    if(!userId){
        throw new ApiError(404, "User not found")
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner: userId,
        videos
    })

    res
    .status(200)
    .json(new ApiResponse(200,playlist,"The playlist was created successfully!"))
    }

    //TODO: create playlist
)

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID format");
    }
// i have not used pagination for this code but can be used for further additional functionality
    const playlists = await Playlist.find({owner: userId}).sort({createdAt:-1})
    if(playlists.length === 0){
        throw new ApiError(404, "No playlist found for the given user")
    }
    res
    .status(200)
    .json(new ApiResponse(200,playlists,"The playlist was fetched successfully"))
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Invalid playlistId")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }
    res
    .status(200)
    .json(new ApiResponse(200,playlist,"The playlist was successfully fetched!"))
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Error in playlistId")
    }
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Error in videoId")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Unable to find the video")
    }
    // if(playlist.videos.includes(videoId)){
    //     throw new ApiError(400,"The video already exists in the playlist")
    // }
    // playlist.videos.push(videoId);
    // await playlist.save();
    
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        
            playlistId,
            {$addToSet: {videos: videoId}},
            {new: true}
        
    );
    if(!updatedPlaylist){
        throw new ApiError(404,"Unable to find the playlist")
    }
    res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"The video was added successfully to the playlist"))
        
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Error in playlistId")
    }
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Error in videoId")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Unable to find the video")
    }
    // if(playlist.videos.includes(videoId)){
    //     throw new ApiError(400,"The video already exists in the playlist")
    // }
    // playlist.videos.push(videoId);
    // await playlist.save();
    
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        
            playlistId,
            {$pull: {videos: videoId}},
            {new: true}
        
    );
    if(!updatedPlaylist){
        throw new ApiError(404,"Unable to find the playlist")
    }
    res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"The video was removed successfully to the playlist"))
        
})
    // TODO: remove video from playlist



const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(404, "Unable to find the playlistID")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Unable to find the playlist")
    }
    await Playlist.findByIdAndDelete(playlistId)

    res
    .status(200)
    .json(new ApiResponse(200,null,"The playlist was deleted successfully!"))


    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const userID = req.user?._id
    const {name, description} = req.body
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(404, "Unable to find the playlistID")
    }
    if(!name && !description){
        throw new ApiError(400,"Name and description are required")
    }
    // if(!userID){
    //     throw new ApiError(400,"Invaid userId")
    // }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Unable to find the playlist")
    }
    if(!playlist.owner.toString()===userID.toString()){
        throw new ApiError(403,"you are not Authorized to update the playlist")
    }
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;

    // Update the playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $set: updateData },  // Update only the fields that are provided
        { new: true }  // Ensures the updated playlist is returned
    );

    res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"The playlist was updated successfully"))

    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}