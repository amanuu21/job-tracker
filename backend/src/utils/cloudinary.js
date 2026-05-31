const multer = require('multer');

// Lazy-initialize cloudinary so missing env vars don't crash startup
let _cloudinary = null;
let _uploadAvatar = null;
let _uploadDocument = null;

const getCloudinary = () => {
  if (!_cloudinary) {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    _cloudinary = cloudinary;
  }
  return _cloudinary;
};

const getUploadAvatar = () => {
  if (!_uploadAvatar) {
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    const storage = new CloudinaryStorage({
      cloudinary: getCloudinary(),
      params: {
        folder: 'job-tracker/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
      },
    });
    _uploadAvatar = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });
  }
  return _uploadAvatar;
};

const getUploadDocument = () => {
  if (!_uploadDocument) {
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    const storage = new CloudinaryStorage({
      cloudinary: getCloudinary(),
      params: {
        folder: 'job-tracker/documents',
        allowed_formats: ['pdf', 'doc', 'docx'],
        resource_type: 'raw',
      },
    });
    _uploadDocument = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
  }
  return _uploadDocument;
};

// Proxy objects so existing code (uploadAvatar.single()) still works
const uploadAvatar = {
  single: (field) => (req, res, next) => getUploadAvatar().single(field)(req, res, next),
  array: (field, max) => (req, res, next) => getUploadAvatar().array(field, max)(req, res, next),
};

const uploadDocument = {
  single: (field) => (req, res, next) => getUploadDocument().single(field)(req, res, next),
  array: (field, max) => (req, res, next) => getUploadDocument().array(field, max)(req, res, next),
};

const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    await getCloudinary().uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

module.exports = { uploadAvatar, uploadDocument, deleteFile };
