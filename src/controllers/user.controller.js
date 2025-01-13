import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/APiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"



const registerUser = asyncHandler( async (req , res)=>{
    // get users detail from frontend
    // validation - not empty
    // check if user already exist: check with username and email
    // check for images ie if avatar is present or not
    // upload them to cloudinary, avatar
    // create a user object for mongo db as it is a nosql - create entry in db
    // remove password and refresh token field from response 
    // check for user creation
    // return the response // or return the error 


    const  {fullName ,email, username, password} = req.body
    console.log("email:", email);

    if (
        [fullName, email, username, password].some((field)=> 
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are compulsory")
    }
    if (
        !email.includes('@') 
    ) {throw new ApiError(400, "Enter valid email address")}

    const existedUser =  User.findOne({
        $or: [{ username } ,{ email }]
    })
    if (existedUser){
        throw new ApiError(409, "User with email or username already exists ")

    }

    const avatarLocalPath = req.files?.avatar[0]?.path ;
    const coverImageLocalPath = req.files?.coverImage[0]?.path ;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user  = await User.create({
        fullName,
        avatar: avatar.url, 
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const userCreated  = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!userCreated) {
        throw new ApiError(500, "Something went wrong while registering the user ")
    }

    return res.status(201).json(
        new ApiResponse(200, userCreated, "User registered successfully")
    )

})


export {registerUser}