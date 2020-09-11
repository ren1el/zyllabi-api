const zyllabis3bucket = require('express').Router();
const aws = require('aws-sdk'); 
const config = require('../utils/config');
const { v4: uuidv4 } = require('uuid');

aws.config.update({
  region: 'us-east-1',
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_KEY
});

const S3_BUCKET = config.BUCKET;

zyllabis3bucket.post('/sign-s3', (req, res) => {
  const s3 = new aws.S3();
  const body = req.body;
  const id = uuidv4();

  const s3Params = {
    Bucket: S3_BUCKET,
    Key: id,
    Expires: 60,
    ContentType: body.fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if(err) {
      console.log(err);
      return res.end();
    }

    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${id}`
    };

    res.write(JSON.stringify(returnData));
    res.end();
  });
});

module.exports = zyllabis3bucket;