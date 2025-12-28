import { Readable } from 'stream';

let cloudinary;

function getCloudinary() {
  if (cloudinary) return cloudinary;
  try {
    // dynamic import so project can run even if cloudinary not installed
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    // require is used intentionally here to allow ESM projects to conditionally load
    // the library at runtime.
    // Node's dynamic import could be used, but keeping commonjs require for clarity.
    // If cloudinary is not installed, meaningful errors will be thrown when used.
    // eslint-disable-next-line import/no-unresolved
    // Using default import style via require('cloudinary').v2
    // eslint-disable-next-line global-require
    const c = require('cloudinary').v2;
    cloudinary = c;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    return cloudinary;
  } catch (err) {
    throw new Error('Cloudinary module is not installed or failed to load. Install `cloudinary` package to enable uploads.');
  }
}

export function uploadBufferToCloudinary(buffer, options = {}) {
  const cl = getCloudinary();
  return new Promise((resolve, reject) => {
    const uploadStream = cl.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });

    const readStream = new Readable();
    readStream.push(buffer);
    readStream.push(null);
    readStream.pipe(uploadStream);
  });
}

export default { uploadBufferToCloudinary };
