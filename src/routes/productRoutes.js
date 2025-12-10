const express = require("express");
const { uploadProduct } = require("../controllers/productController");
const { upload } = require("../middleware/upload");
const route = express.Router();

route.post("/", upload.single("image"), uploadProduct);

module.exports = route;
