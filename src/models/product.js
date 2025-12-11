const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  imageId: { type: String },
});

module.exports = mongoose.model("Product", userSchema);
