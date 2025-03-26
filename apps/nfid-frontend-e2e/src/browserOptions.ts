export const chromeBrowserOptions: IChromeOption = {
  args: [
    "--no-sandbox",
    "--disable-gpu",
    "--disable-infobars",
    "--disable-web-security",
    "--disable-notifications",
    "--disable-dev-shm-usage",
    "--allow-insecure-localhost",
    "--ignore-certificate-errors",
  ],
}

export const chromeBrowser = {
  browserName: "chrome",
  acceptInsecureCerts: true,
  "goog:chromeOptions": {
    ...chromeBrowserOptions,
    args: [
      ...chromeBrowserOptions.args,
      "--window-size=1920, 1080",
    ],
  },
  "goog:loggingPrefs": {
    browser: "ALL",
    driver: "ALL",
  },
  "webauthn:extension:credBlob": true,
  "webauthn:extension:largeBlob": true,
  "webauthn:virtualAuthenticators": true,
}

export const mobileChromeBrowser = {
  browserName: "chrome",
  acceptInsecureCerts: true,
  "goog:chromeOptions": {
    mobileEmulation: {
      deviceMetrics: {
        pixelRatio: 2,
        touch: true,
      },
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) " +
        "AppleWebKit/605.1.15 (KHTML, like Gecko) " +
        "Version/13.0.3 Mobile/15E148 Safari/604.1",
    },
    args: [
      ...chromeBrowserOptions.args,
      "--window-size=500,812",
    ],
  },
  "goog:loggingPrefs": {
    browser: "ALL",
    driver: "ALL",
  },
  "webauthn:extension:credBlob": true,
  "webauthn:extension:largeBlob": true,
  "webauthn:virtualAuthenticators": true,
}
