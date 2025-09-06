const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Function to configure and return the multer upload instance
function createMulterUpload(
  destinationFolder = "uploads",
  allowedTypes = /jpeg|jpg|png/,
  fileSizeLimit = 5 * 1024 * 1024,
  fieldName = "images"
) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = destinationFolder;
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: fileSizeLimit },
    fileFilter: (req, file, cb) => {
      const mimeType = allowedTypes.test(file.mimetype);
      const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
      );

      if (mimeType && extname) {
        return cb(null, true);
      }
      cb(new Error("Only .jpg, .jpeg, .png formats are allowed"));
    },
  }).array(fieldName, 10000); // Can handle up to 10000 images if needed

  return upload;
}

module.exports = { createMulterUpload };
