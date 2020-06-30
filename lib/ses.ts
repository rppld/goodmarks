import aws from 'aws-sdk'

aws.config.update({
  accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
  secretAccessKey: process.env.AMAZON_SECRET_KEY,
  region: process.env.AMAZON_REGION,
})

// New S3 class
const ses = new aws.SES()

export const sendCommentNotification = (toEmail, bookmarkUrl) => {
  const params = {
    Source: 'Goodmarks <support@goodmarks.app>',
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `Someone left a comment on <a href="${bookmarkUrl}">your bookmark</a>.`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'New comment on your bookmark',
      },
    },
  }

  ses
    .sendEmail(params)
    .promise()
    .then((res) => console.log(res))
    .catch((error) => console.log(error))
}
