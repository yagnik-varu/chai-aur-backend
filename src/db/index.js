import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async()=>{
    try{
       const connectionInstence =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       console.log(`MongoDb connected DB:HOST:${connectionInstence.connection.host}`);
    //    console.log(connectionInstence)

    }catch(error){
        console.log("mongodb connection error ",error)
        process.exit(1)
    }
}

export default connectDB;