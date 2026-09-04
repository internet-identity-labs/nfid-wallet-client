export const isHeadless = process.env.IS_HEADLESS === "true"

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

if (isHeadless) {
  chromeBrowserOptions.args.push("--headless=new")
}

export const chromeBrowser = {
  browserName: "chrome",
  "wdio:enforceWebDriverClassic": true,
  acceptInsecureCerts: true,
  "goog:chromeOptions": {
    ...chromeBrowserOptions,
    args: [
      ...chromeBrowserOptions.args,
      "--window-size=1920,1080",
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
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
  "wdio:enforceWebDriverClassic": true,
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
    args: [...chromeBrowserOptions.args, "--window-size=500,812"],
  },
  "goog:loggingPrefs": {
    browser: "ALL",
    driver: "ALL",
  },
  "webauthn:extension:credBlob": true,
  "webauthn:extension:largeBlob": true,
  "webauthn:virtualAuthenticators": true,
}
