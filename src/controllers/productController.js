const { cloudinary } = require("../config/cloudinary");

exports.uploadProduct = async (req, res) => {
  try {
    const { title, description } = req.body;
    // console.log(req.file);
    if (!req.file) {
      return res.status(400).json("image is required");
    }
    // Upload to Cloudinary using buffer
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products" }, // optional folder name
      (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json("Cloudinary upload failed");
        }

        res.status(200).json({
          title,
          description,
          imageUrl: result.secure_url, // Cloudinary URL
        });
      }
    );

    stream.end(req.file.buffer); // send buffer to Cloudinary
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};
