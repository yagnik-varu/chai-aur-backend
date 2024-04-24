import mongoose,{Schema} from "mongoose"
const subscriptionSchema = Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
})

    
const Subscription = mongoose.model("Subscription",subscriptionSchema)


export default Subscription