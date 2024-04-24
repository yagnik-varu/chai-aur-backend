import {Router} from "express";
import { registerUser,loginUser,logOutUser,refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:2
        }
    ]),
    registerUser)

router.route('/login').post(loginUser)

//secure routes
router.route('/logout').post(verifyJwt,logOutUser)
router.route("refresh-token").post(refreshAccessToken)

export default(router)