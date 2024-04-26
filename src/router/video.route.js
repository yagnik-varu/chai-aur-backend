import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo,updateVideo,togglePublishStatus } from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addHistory } from "../middlewares/watchHistory.middleware.js";
import { addView } from "../middlewares/addView.middleware.js";

const router = Router();
router.route('/')
.get(getAllVideos)
.post(
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
    publishAVideo
)


router.route('/:id')
.get(getVideoById)
.delete(deleteVideo)
.patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:id").patch(togglePublishStatus);

export default router