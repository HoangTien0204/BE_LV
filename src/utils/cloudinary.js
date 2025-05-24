const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: 'djyzanulo',
  api_key: '516353164792129',
  api_secret: 'Sj3VcQN7KbI560-pcJWKV6S3F70'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // tên folder lưu ảnh trên cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg']
  }
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
