const { cloudinary } = require("../config/cloudinary");
const Product = require("../models/product");

exports.uploadProduct = async (req, res) => {
  try {
    const { title, description } = req.body;
    // console.log(req.file);
    if (!title || !description) {
      return res.status(401).json("input all fileds");
    }
    if (!req.file) {
      return res.status(400).json("image is required");
    }
    // console.log(req.file);
    // res.json(req.file);

    // Upload to Cloudinary using buffer
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json("Cloudinary upload failed");
        }

        const product = {
          title,
          description,
          image: result.secure_url,
          imageId: result.public_id,
        };

        await Product.create(product);
        res.status(200).json({
          message: "success",
          product,
        });
      }
    );

    stream.end(req.file.buffer);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      res.status(400).json("PRoduct not Fount");
    }

    if (product.imageId) {
      await cloudinary.uploader.destroy(product.imageId);
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json("product delete succesfully");
  } catch (error) {
    console.log(error);
    res.status(400).json(error.message);
  }
};
