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


//routes declaration
app.use("/api/v1/user",userRouter);
app.use("/api/v1/video",videoRouter);
app.use('/api/v1/comment',commentRouter);
app.use('/api/v1/subscription',subscriptionRouter);