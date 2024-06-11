export const chromeBrowser = {
  browserName: 'chrome',
  chromeOptions: {
    args: [
      '--headless',
      '--disable-infobars',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080',
    ],
  },
  loggingPrefs: {
    browser: 'ALL',
    driver: 'ALL',
  },
};
