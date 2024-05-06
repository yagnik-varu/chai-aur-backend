import mongoose, { Schema, mongo } from "mongoose";

const ActivitySchema = new Schema({

    method: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    eventInitiatedBy: {
        type: String,
        required: false,
    },
    responseMessage: {
        type: String,
        required: true,
    },
    responseBody: {
        type: String,
        required: true,
    },
    statusCode: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true
    }
})

const Activity = mongoose.model("Activity",ActivitySchema);
export default Activity;