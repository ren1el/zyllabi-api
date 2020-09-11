require('dotenv').config();

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

const AWS_ACCESS_KEY_ID = process.env.AWSAccessKeyId;
const AWS_SECRET_KEY = process.env.AWSSecretKey;
const BUCKET = process.env.Bucket;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

module.exports = {
  PORT,
  MONGODB_URI,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_KEY,
  BUCKET,
  GOOGLE_CLIENT_ID
};