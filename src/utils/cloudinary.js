import {v2 as cloudinary} from 'cloudinary';

          
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
    console.log("file is uploaded on coludinary",response.url)
    return response;
  }catch(error){
    console.log("error in file upload cloudinary",error)
    fs.unlinkSync(loacalFilePath)
    return null;
  }
}

export {uploadOnCloudinary};