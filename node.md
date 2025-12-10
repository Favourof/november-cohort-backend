---

const streamUpload = (req) => {
return new Promise((resolve, reject) => {
const stream = cloudinary.uploader.upload_stream(
{ folder: "products" },
(error, result) => {
if (result) resolve(result);
else reject(error);
}
);

        stream.end(req.file.buffer);
      });
    };

    const result = await streamUpload(req)

    ---
