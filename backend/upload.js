const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Resolve public directory – fallback to ./public inside backend
const getPublicDir = () => {
  return process.env.PUBLIC_DIR
    ? path.resolve(process.env.PUBLIC_DIR)
    : path.join(__dirname, "public");
};

// Validate image MIME types
const imageFileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, png, gif, webp) are allowed"), false);
  }
};

// Generate a unique filename
const fileName = function (req, file, cb) {
  const extArray = file.mimetype.split("/");
  const extension = extArray[extArray.length - 1];
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  cb(null, file.fieldname + "-" + uniqueSuffix + "." + extension);
};

// Storage – shop logo
const storageShopLogo = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(getPublicDir(), "uploads", "shop");
    fs.mkdirSync(dir, { recursive: true });
    return cb(null, dir);
  },
  filename: fileName,
});

// Storage – product image
const storageProductImage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(getPublicDir(), "uploads", "product");
    fs.mkdirSync(dir, { recursive: true });
    return cb(null, dir);
  },
  filename: fileName,
});

// Storage – user avatar
const storageUserAvatar = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(getPublicDir(), "uploads", "user");
    fs.mkdirSync(dir, { recursive: true });
    return cb(null, dir);
  },
  filename: fileName,
});

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5 MB default

const uploadShopLogo = multer({
  storage: storageShopLogo,
  fileFilter: imageFileFilter,
  limits: { fileSize: maxFileSize },
});

const uploadProductImage = multer({
  storage: storageProductImage,
  fileFilter: imageFileFilter,
  limits: { fileSize: maxFileSize },
});

const uploadUserAvatar = multer({
  storage: storageUserAvatar,
  fileFilter: imageFileFilter,
  limits: { fileSize: maxFileSize },
});

module.exports = {
  uploadShopLogo,
  uploadProductImage,
  uploadUserAvatar,
};
