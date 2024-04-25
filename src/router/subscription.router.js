import { Router } from 'express';
import {
    getChannelSubscribers,
    getSubscribedChannels,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJwt} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

router
    .route("/channel-subscriber/:channelId")
    .get(getChannelSubscribers)//get total subscriber of channel
    .post(toggleSubscription);

router.route("/user/:subscriberId").get(getSubscribedChannels);//get subscribed channel by user

export default router