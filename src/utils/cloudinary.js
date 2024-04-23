import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY, 
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
});

const uploadOnCloudinary = async (loacalFilePath)=>{
  try{
    if(!loacalFilePath) return null;
    const response = await cloudinary.uploader.upload(loacalFilePath,{
      resource_type:'auto'
    })
    
    fs.unlinkSync(loacalFilePath)
    console.log("file is uploaded on coludinary",response.url)
    return response;
  }catch(error){
    fs.unlinkSync(loacalFilePath)
    console.log("error in file upload cloudinary",error)
    return null;
  }
}

export {uploadOnCloudinary};