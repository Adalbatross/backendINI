import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthCheck = asyncHandler(async (req, res) => {
    res
    .status(200)
    .json(new ApiResponse(200,{
        status: "OK",
        uptime: process.uptime(),  // Server uptime in seconds
        timestamp: new Date().toISOString()  // Current server time
    },"Everything is ok"))

    //TODO: build a healthcheck response that simply returns the OK status as json with a message
})

export {
    healthCheck
    }