export class Page {
  private get loader() {
    return $("#loader")
  }

  public async openBaseUrl() {
    await browser.url("/")
  }

  public async openPage(page: string) {
    browser.url(browser.options.baseUrl + page)
  }

  // -1 retrieves the last window, or -2 gets the first one
  public async switchToWindow(window?: string) {
    const positionNumber: number = window === "last" ? -1 : -2
    if (window) {
      expect((await browser.getWindowHandles()).length).toBeGreaterThan(1)
    }
    const windowHandles = await browser.getWindowHandles()
    browser.switchToWindow(windowHandles.slice(positionNumber)[0])
  }

  public async waitForLoaderDisappear() {
    try {
      await this.loader.waitForDisplayed({ timeout: 3000 })
      await this.loader.waitForDisplayed({ timeout: 20000, reverse: true })
    } catch (e: any) {
      // console.log(e);
    }
  }
}
