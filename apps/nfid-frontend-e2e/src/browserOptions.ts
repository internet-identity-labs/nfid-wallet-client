export const chromeBrowserOptions: IChromeOption = {
  args: [
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-infobars",
    "--disable-web-security",
    "--disable-notifications",
    "--disable-dev-shm-usage",
    "--window-size=1920,1080",
    "--allow-insecure-localhost",
    "--ignore-certificate-errors",
    "--user-data-dir=chrome-user-data-dir",
  ],
};

export const chromeBrowser = {
  browserName: "chrome",
  acceptInsecureCerts: true,
  "goog:chromeOptions": chromeBrowserOptions,
  "goog:loggingPrefs": { 
    browser: "ALL", 
    driver: "ALL",
  },
  "webauthn:extension:credBlob": true,
  "webauthn:extension:largeBlob": true,
  "webauthn:virtualAuthenticators": true,
};
