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
    .get(getChannelSubscribers)//LIST OF CURRNT CHANNEL SUBSCRIBER
    .post(toggleSubscription);

router.route("/user/:subscriberId").get(getSubscribedChannels);//LIST OF CHANEEL SUBSCRIBE BY USER

export default router