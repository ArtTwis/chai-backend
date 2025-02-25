import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFileOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload file on cloudinary..
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file has uploaded successfully..
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    // removed the local saved temprary saved file
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export const deleteAssetOnCloudinary = async (oldAssetPath) => {
  const response = await cloudinary.uploader.destroy(oldAssetPath, {
    resource_type: "auto",
  });

  return response;
};
