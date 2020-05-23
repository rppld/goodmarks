import aws from 'aws-sdk'
import getUUID from 'utils/get-uuid'

aws.config.update({
  accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
  secretAccessKey: process.env.AMAZON_SECRET_KEY,
  region: process.env.AMAZON_REGION,
})

// Set AWS to use native promises
aws.config.setPromisesDependency(null)

// New S3 class
const s3 = new aws.S3()

// Function to delete a file from the bucket
export const deleteObject = (fileName) => {
  const params = {
    Bucket: process.env.AMAZON_S3_BUCKET_NAME,
    Key: fileName,
  }
  s3.deleteObject(params, (err, data) => {
    if (!err) {
      return data
    }
    return false
  })
}

export const post = async (name, contentType) => {
  const sanitizedName = name.replace(/ /g, '_')
  // This works for png, jpg, pdf, ...
  const s3key = `${sanitizedName}_${getUUID()}.${contentType.split('/').pop()}`
  // Prepare params
  const params = {
    Bucket: process.env.AMAZON_S3_BUCKET_NAME,
    Fields: { key: s3key },
    Expires: 60 * 10, // 10 min
    Conditions: [
      { bucket: process.env.AMAZON_S3_BUCKET_NAME },
      { key: s3key }, // Our generated key
      { acl: 'private' }, // Private bucket
      { 'Content-Type': contentType },
      ['content-length-range', 8000, 8000000], // From 1KB to 1MB
    ],
  }

  let signedPost = await s3.createPresignedPost(params)
  signedPost = Object.assign(signedPost, {
    'Content-Type': contentType,
    acl: 'private',
  })

  return signedPost
}
