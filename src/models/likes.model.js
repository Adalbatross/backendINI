import mongoose, {Schema} from "mongoose";

const likesSchema = new Schema(
    {
        videos:{
            type: Schema.types.ObjectId,
            ref:"Video"
        },
        comment:{
            type: Schema.types.ObjectId,
            ref:"Comment"
        },
        tweet:{
            type: Schema.types.ObjectId,
            ref:"Tweet"
        },
        likedBy:{
            type: Schema.types.ObjectId,
            ref:"User"
        }
    }
    ,{timestamps: true});

export const Likes =  mongoose.model("Likes", likesSchema);