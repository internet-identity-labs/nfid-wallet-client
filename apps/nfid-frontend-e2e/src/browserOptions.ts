export const chromeBrowserOptions: IChromeOption = {
  args: [
    "--no-sandbox",
    // "--use-fake-device-for-media-stream",
    "--disable-notifications",
    "--disable-web-security",
    "--allow-insecure-localhost",
    "--disable-infobars",
    "--disable-dev-shm-usage",
    "--start-maximized",
    "--ignore-certificate-errors",
    "--disable-gpu",
    // "--enable-features=NetworkService,NetworkServiceInProcess"
    `--user-data-dir=${process.env.USER_DATA_DIR}`,
  ],
  w3c: false,
}

export const chromeBrowser = {
  browserName: "chrome",
  "goog:chromeOptions": chromeBrowserOptions,
  "goog:loggingPrefs": { browser: "ALL", driver: "ALL" },
  acceptInsecureCerts: true,
}

export const firefoxBrowser = {}
