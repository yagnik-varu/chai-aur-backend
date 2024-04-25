import express from "express"
import cookieParser from 'cookie-parser'  
import cors from 'cors';  
const app = express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json())

app.use(cookieParser())
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"))

//routes import
import userRouter from './router/user.route.js'
import videoRouter from './router/video.route.js'


//routes declaration
app.use("/api/v1/user",userRouter);
app.use("/api/v1/video",videoRouter);


export {app}
