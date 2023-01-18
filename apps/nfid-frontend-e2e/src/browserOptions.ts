const deviceName = process.env.DEVICE_NAME;
const isHeadless = process.env.IS_HEADLESS;

const chromeBrowserOptions: IChromeOption = {
  args: [
    // '--window-size=1920,1080',
    '--no-sandbox',
    // '--use-fake-device-for-media-stream',
    '--disable-notifications',
    '--allow-insecure-localhost',
    '--disable-infobars',
    // '--disable-dev-shm-usage',
    '--ignore-certificate-errors',
    '--disable-gpu',
    // "--enable-features=NetworkService,NetworkServiceInProcess"
    `--user-data-dir=${process.env.USER_DATA_DIR}`
  ],
}

if (deviceName) {
  chromeBrowserOptions.mobileEmulation = { deviceName };
}

if (isHeadless) {
  chromeBrowserOptions.args.push('--headless');
}

export const chromeBrowser = {
  browserName: "chrome",
  "goog:chromeOptions": chromeBrowserOptions,
  "goog:loggingPrefs": { browser: "ALL", driver: "ALL" },
  acceptInsecureCerts: true
}

export const firefoxBrowser = {

}

