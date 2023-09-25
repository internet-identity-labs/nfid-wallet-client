export const chromeBrowserOptions: IChromeOption = {
  args: [
    "--no-sandbox",
    "--disable-notifications",
    "--disable-web-security",
    "--allow-insecure-localhost",
    "--disable-infobars",
    "--disable-dev-shm-usage",
    "--ignore-certificate-errors",
    "--disable-gpu",
    "--user-data-dir=chrome-user-data-dir",
    // "--use-fake-device-for-media-stream",
    // "--enable-features=NetworkService,NetworkServiceInProcess"
    // "--start-maximized",
    // "--auto-open-devtools-for-tabs",
  ],
  // w3c: false,
}

export const chromeBrowser = {
  browserName: "chrome",
  "goog:chromeOptions": chromeBrowserOptions,
  "goog:loggingPrefs": { browser: "ALL", driver: "ALL" },
  acceptInsecureCerts: true,
  "webauthn:extension:credBlob": true,
  "webauthn:extension:largeBlob": true,
  "webauthn:virtualAuthenticators": true,
}

export const firefoxBrowser = {}
