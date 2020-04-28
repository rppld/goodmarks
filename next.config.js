module.exports = {
  experimental: {
    reactRefresh: true,
  },
  env: {
    // Set the fauna server key in the .env file and make it available
    // at Build Time.
    FAUNA_SERVER_KEY: process.env.FAUNA_SERVER_KEY,
  },
}
