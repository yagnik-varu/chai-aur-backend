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
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"))

//routes import
import userRouter from './router/user.route.js'


//routes declaration
app.use("/api/v1/user",userRouter);


export {app}
