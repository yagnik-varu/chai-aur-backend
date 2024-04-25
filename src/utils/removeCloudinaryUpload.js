import {v2 as cloudinary} from 'cloudinary';
import { ApiError } from './ApiError.js';
import { extractPublicId } from 'cloudinary-build-url'

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY, 
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
});

const removeFromCloudinary = async (path,isVideo=false)=>{
  // console.log(path)
  try{
    const publicId = extractPublicId(path);
    console.log(publicId)
    let options={}
    if(isVideo){
      options.resource_type="video";
    }else{
      options.resource_type="image";

    }
    const response = await cloudinary.uploader.destroy(publicId,options);
    console.log("deleted successfully",response);
  }catch(error){
    console.log(error.message)
    throw new ApiError(500,"failed to delete document from cloudinary",error.message)
  }
}

export {removeFromCloudinary};