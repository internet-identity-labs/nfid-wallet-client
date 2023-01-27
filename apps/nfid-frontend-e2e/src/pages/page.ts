import { timeout } from "@dfinity/agent/lib/cjs/polling/strategy";

export class Page {

  private get loader() {
    return $("#loader");
  }

  public async openUrl(path: string) {
    return await browser.url(path);
  }

  public async openPage(page: string) {
    browser.url(browser.options.baseUrl + page);
  }

  // -1 retrieves the last window, or -2 gets the first one
  public async switсhToWindow(window?: string) {
    const positionNumber: number = window === "last" ? -1 : -2
    if (window) {
      expect((await browser.getWindowHandles()).length).toBeGreaterThan(1);
    }
    const windowHandles = await browser.getWindowHandles();
    browser.switchToWindow(windowHandles.slice(positionNumber)[0]);
  }

  public async waitForLoaderDisappear() {
    (await this.loader).waitForDisplayed({timeout: 20000, reverse: true});
  }

}
