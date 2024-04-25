import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadVideoAndSave } from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/upload').post(
    verifyJwt,
    upload.fields([
        {
            name:"video",
            maxCount:1
        },{
            name:"thumbnail",
            maxCount:1,
        }
    ]),
    uploadVideoAndSave
)

export default(router)