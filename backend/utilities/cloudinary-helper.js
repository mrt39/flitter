//helper functions for cloudinary image uploads
const cloudinary = require('../configuration/cloudinary-config');

//prepare image for upload to cloudinary
function prepareImageForUpload(req) {
  //req.file.buffer to access the image data that's stored in the memory
  const b64 = Buffer.from(req.file.buffer).toString("base64");
  
  //make data readable/usable
  return "data:" + req.file.mimetype + ";base64," + b64;
}

//upload image to cloudinary
async function uploadImageToCloudinary(dataURI, options = {}) {
  try {
    const uploadResult = await cloudinary.uploader.upload(
      dataURI,
      options
    );
    return uploadResult;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

module.exports = {
  prepareImageForUpload,
  uploadImageToCloudinary
};