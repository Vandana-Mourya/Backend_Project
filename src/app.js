import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import timeout from 'connect-timeout'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({limit: "50mb", extended:true}))
app.use(timeout('300s'))
app.use(express.static("public"))
app.use(cookieParser())

import userRoutes from './routes/user.routes.js'
import vidoeRoutes from './routes/video.routes.js'
import tweetRoutes from './routes/tweet.routes.js'
import playlistRoutes from './routes/playlist.routes.js'
import commentRoutes from './routes/comment.routes.js'

//routes declaration
app.use("/api/v1/users", userRoutes)
app.use('/api/v1/videos', vidoeRoutes)
app.use('/api/v1/tweets', tweetRoutes)
app.use('/api/v1/playlists', playlistRoutes)
app.use('/api/v1', commentRoutes)

// http://localhost:8000/api/v1/users/register



export { app }