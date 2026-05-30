const cloudinary = require("../config/cloudinary");

const uploadBufferToCloudinary = (file, folder = "mern-ecommerce/products") => {
  if (!file) {
    return null;
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("Cloudinary environment variables are required for image upload");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result.secure_url);
      }
    );

    uploadStream.end(file.buffer);
  });
};

const uploadFilesToCloudinary = async (files = []) => {
  const uploads = files.map((file) => uploadBufferToCloudinary(file));
  return Promise.all(uploads);
};

module.exports = {
  uploadBufferToCloudinary,
  uploadFilesToCloudinary
};
