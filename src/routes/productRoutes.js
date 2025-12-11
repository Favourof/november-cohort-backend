const express = require("express");
const {
  uploadProduct,
  deleteProduct,
} = require("../controllers/productController");
const { upload } = require("../middleware/upload");
const route = express.Router();

route.post("/", upload.single("image"), uploadProduct);
route.delete("/:id", deleteProduct);

module.exports = route;
