import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import

import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import tweetsRouter from './routes/tweets.routes.js'
import subscribtionRouter from './routes/subscribtion.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import likesRouter from './routes/likes.routes.js'
import healthCheckRouter from './routes/healthcheck.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
import commentsRouter from './routes/comments.routes.js'


//routes declaration

app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/tweets", tweetsRouter)
app.use("/api/v1/subscribtion", subscribtionRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/likes", likesRouter)
app.use("/api/v1/healthCheck", healthCheckRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/comments", commentsRouter)


// http://localhost:8000/api/v1/users/register

export { app }  