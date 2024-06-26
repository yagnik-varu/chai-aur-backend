import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from "./app.js"
dotenv.config({
    path:'./env'
})
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("database connection failed !!",err)
})

//routes import

import userRouter from './router/user.route.js'
import videoRouter from './router/video.route.js'
import commentRouter from './router/comment.route.js'
import subscriptionRouter from './router/subscription.router.js'
import tweetRouter from './router/tweet.route.js'
import likeRouter from './router/like.router.js'
import playlistRouter from './router/playlist.route.js'
import dashboardRouter from './router/dashboard.route.js'
import { healthcheck } from "./controllers/healthcheck.controller.js";


//routes declaration
// app.use(morgan(':method :url :status :res[content-length] - :response-time ms :response-message'));

app.use("/api/v1/user",userRouter);
app.use("/api/v1/video",videoRouter);
app.use('/api/v1/comment',commentRouter);
app.use('/api/v1/subscription',subscriptionRouter);
app.use('/api/v1/tweet',tweetRouter);
app.use('/api/v1/like',likeRouter);
app.use('/api/v1/playlist',playlistRouter)
app.use('/api/v1/dashboard',dashboardRouter)
app.use('/api/health',healthcheck)