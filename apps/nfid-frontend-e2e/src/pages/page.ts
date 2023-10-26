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
      await browser.waitUntil(
        async () => (await browser.getWindowHandles()).length > 1,
        {
          timeout: 7000,
          timeoutMsg: "Google account iframe is not appeared",
        },
      )
    }
    const windowHandles = await browser.getWindowHandles()
    browser.switchToWindow(windowHandles.slice(positionNumber)[0])
  }

  public async waitForLoaderDisappear() {
    let counter = 0
    try {
      await this.loader.waitForDisplayed({ timeout: 8000 })
    } catch (e: any) {
      return
    }
    while ((await this.loader.isDisplayed()) && counter < 5) {
      try {
        await this.loader.waitForDisplayed({ timeout: 3000 })
        await this.loader.waitForDisplayed({ timeout: 20000, reverse: true })
      } catch (e: any) {
        ++counter
        // console.log(e);
      }
    }
  }

  public async waitForDataCacheLoading() {
    await browser.waitUntil(
      async function () {
        return (await $("#root").getAttribute("data-cache-loaded")) === "true"
      },
      {
        timeout: 15000,
        timeoutMsg: "expected data-cache-loaded to be true after 15s",
      },
    )
  }

  loginUsingIframe(profileType?: string, targets?: string, derivation?: string) {
  }
}
