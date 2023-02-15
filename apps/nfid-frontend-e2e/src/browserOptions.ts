export const chromeBrowserOptions: IChromeOption = {
  args: [
    "--no-sandbox",
    "--ignore-certificate-errors",
    `--user-data-dir=${process.env.USER_DATA_DIR}`,
    "--disable-web-security",
    "--disable-gpu",
    // "--start-maximized",
    // '--use-fake-device-for-media-stream',
    // "--disable-notifications",
    // "--allow-insecure-localhost",
    "--disable-infobars",
    // '--disable-dev-shm-usage',
    // "--enable-features=NetworkService,NetworkServiceInProcess"
  ],
  "w3c": false
}

export const chromeBrowser = {
  browserName: "chrome",
  "goog:chromeOptions": chromeBrowserOptions,
  "goog:loggingPrefs": { browser: "ALL", driver: "ALL" },
  acceptInsecureCerts: true,
}

export const firefoxBrowser = {}
