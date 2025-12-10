// // src/middleware/upload.js
// const multer = require("multer");

// // configure storage (optional, defaults to memory if not set)
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // folder where files will be saved
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// // create the multer instance
// const upload = multer({ storage: storage });

// // export it
// module.exports = { upload };

// src/middleware/upload.js
const multer = require("multer");

// use memory storage so we can send buffer to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = { upload };
