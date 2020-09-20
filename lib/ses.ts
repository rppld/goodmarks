import aws from 'aws-sdk'

aws.config.update({
  accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
  secretAccessKey: process.env.AMAZON_SECRET_KEY,
  region: process.env.AMAZON_REGION,
})

// New S3 class
const ses = new aws.SES()

export const sendPasswordResetEmail = (toEmail, resetUrl) => {
  const params = {
    Source: 'Goodmarks <support@goodmarks.app>',
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
          <style>
            form   { background-color: #F3F4F8; }
            span   { display:inline-block; border-radius:4px; background-color:#485C80;}
            a      { min-width:196px; border-top:13px solid; border-bottom:13px solid; border-right:24px solid; border-left:24px solid; border-color:#2ea664; border-radius:4px; background-color:#2ea664; color:#ffffff; font-size:18px; line-height:18px; word-break:break-word; display:inline-block; text-align:center; font-weight:900; text-decoration:none !important }
          </style>
          <div> 
            <h1>We have received a request to reset the password for your Goodmarks account.</h1>
            <span><a 
              href="${resetUrl}" 
              target="_blank">Reset</a></span>
          </div>
          `,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Password reset request',
      },
    },
  }

  ses
    .sendEmail(params)
    .promise()
    .then((res) => console.log(res))
    .catch((error) => console.log(error))
}

export const sendAccountVerificationEmail = (toEmail, confirmUrl) => {
  const params = {
    Source: 'Goodmarks <support@goodmarks.app>',
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
          <style>
            form   { background-color: #F3F4F8; }
            span   { display:inline-block; border-radius:4px; background-color:#485C80;}
            a      { min-width:196px; border-top:13px solid; border-bottom:13px solid; border-right:24px solid; border-left:24px solid; border-color:#2ea664; border-radius:4px; background-color:#2ea664; color:#ffffff; font-size:18px; line-height:18px; word-break:break-word; display:inline-block; text-align:center; font-weight:900; text-decoration:none !important }
          </style>
          <div> 
            <h1>Verify your email address to activate your Goodmarks account.</h1>
            <span><a 
              href="${confirmUrl}" 
              target="_blank">Verify email</a></span>
          </div>
          `,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Activate your Goodmarks account',
      },
    },
  }

  ses
    .sendEmail(params)
    .promise()
    .then((res) => console.log(res))
    .catch((error) => console.log(error))
}
