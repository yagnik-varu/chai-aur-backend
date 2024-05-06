import express from "express"
import cookieParser from 'cookie-parser'  
import cors from 'cors';  
import logMiddleware from "./utils/LogMiddleware.js";
const app = express()
app.use(logMiddleware)
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json())

app.use(cookieParser())
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"))




export {app}
