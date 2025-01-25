import mongoose, {Schema} from "mongoose";

const playlistSchema = new Schema(
    {
        name:{
            type:String,
            required:[true, "Please enter the name of the playlist"],
        },
        description:{
            type:String,
            required:true,
        },
        videos:[{
            type: Schema.types.ObjectId,
            ref:"Video"
        }],
        owner:{
            type: Schema.types.ObjectId,
            ref:"User"
        }


    }
    ,{timestamps: true});

export const Playlist =  mongoose.model("Playlist", playlistSchema);