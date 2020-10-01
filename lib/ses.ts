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
          <div style="font-family: sans-serif; max-width: 600px;">
          <div style="padding: 24px 0; border-bottom: 1px solid #e5e5e5">
            <img src="https://goodmarks.app/logo-h48.png" height="24" />
          </div>
          <p style="font-size: 18px; line-height: 1.4; color: #666666">
            We have received a request to reset the password of your Goodmarks account.
          </p>
          <a
            href="${resetUrl}"
            style="
              width: 100%;
              background-color: #000000;
              color: #ffffff;
              border-radius: 16px;
              margin-top: 16px;
              display: block;
              text-decoration: none;
              font-size: 18px;
              padding: 16px 0;
              text-align: center;
            "
            target="_blank"
            >Reset password</a
          >
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
          <div style="font-family: sans-serif; max-width: 600px;">
          <div style="padding: 24px 0; border-bottom: 1px solid #e5e5e5">
            <img src="https://goodmarks.app/logo-h48.png" height="24" />
          </div>
          <p style="font-size: 18px; line-height: 1.4; color: #666666">
            Verify your email address to activate your Goodmarks account.
          </p>
          <a
            href="${confirmUrl}"
            style="
              width: 100%;
              background-color: #000000;
              color: #ffffff;
              border-radius: 16px;
              margin-top: 16px;
              display: block;
              text-decoration: none;
              font-size: 18px;
              padding: 16px 0;
              text-align: center;
            "
            target="_blank"
            >Verify email</a
          >
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
