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



// [
//     {
//       $match: {
//         owner:ObjectId('66289f8f6b5a3fe2bbc33afa')
//       }
//     },
//     {
//       $lookup: {
//         from: 'subscriptions',
//         localField: 'owner',
//         foreignField: 'channel',
//         as: "SubscriberList",
//       }
//     },
//     {
//       $addFields: {
//         SubscriberListCount:{
//           $size:'$SubscriberList'
//         }
//       }
//     },
//     {
//       $lookup: {
//         from: 'likes',
//         localField: '_id',
//         foreignField: 'video',
//         as: "LikePerVideo"
//       }
//     },
//     {
//       $lookup: {
//         from: 'comments',
//         localField: '_id',
//         foreignField: 'video',
//         as: "commentsOnVideo"
//       }
//     },
//     {
//       $addFields: {
//         TotalLikes: {
//           $size:'$LikePerVideo'
//         },
//         TotalComments:{
//           $size:'$commentsOnVideo'
//         },
//         TotalSubscriber:{
//           $size:"$SubscriberList"
//         }
//       }
//     },
//     {
//       $project: {
//         SubscriberList:0,
//         LikePerVideo:0,
//         createdAt:0,
//         updatedAt:0,
//         description:0,
//         videoFile:0,
//         title:0,
        
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         totalView: {
//           $sum: '$views'
//         },
//         totalLikes: {
//           $sum:'$TotalLikes'
//               },
//         totalVideo: {
//           $sum:1
//         },
//         totalDuration:{
//           $sum:'$duration'
//         },
//         totalComments:{
//           $sum:"$TotalComments"
//         },
//         totalSubscriber:{
//           $sum:"$TotalSubscriber"
//         }
//       },
//     }
//   ]