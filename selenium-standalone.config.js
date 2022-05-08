module.exports = {
  drivers: {
    chrome: {
      // This version needs to match the chrome version on GitHub Actions
      version: '99.0.4844.51',
      arch: process.arch,
      baseURL: 'https://chromedriver.storage.googleapis.com'
    },
  },
}
