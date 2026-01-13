export class Page {
  get loader() {
    return $("#loader")
  }

  get slider() {
    return $("#slider")
  }

  async openBaseUrl() {
    await browser.url("/")
  }

  async openPage(page: string) {
    await browser.url(browser.options.baseUrl + page)
  }

  // -1 retrieves the last window, or -2 gets the first one
  async switchToWindow(window?: string) {
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
    await browser.switchToWindow(windowHandles.slice(positionNumber)[0])
  }

  async waitForLoaderDisappear() {
    let counter = 0
    try {
      await this.loader.waitForDisplayed({ timeout: 8000 })
    } catch (_e: any) {
      return
    }
    while ((await this.loader.isDisplayed()) && counter < 5) {
      try {
        await this.loader.waitForDisplayed({ timeout: 3000 })
        await this.loader.waitForDisplayed({ timeout: 20000, reverse: true })
      } catch (_e: any) {
        ++counter
        // console.log(e);
      }
    }
  }

  async waitForDataCacheLoading() {
    await browser.waitUntil(
      async () => {
        return (await $("#root").getAttribute("data-cache-loaded")) === "true"
      },
      {
        timeout: 15000,
        timeoutMsg: "expected data-cache-loaded to be true after 15s",
      },
    )
  }

  async clickOnLeftUpperCorner() {
    await browser.performActions([
      {
        type: "pointer",
        id: "mouse",
        parameters: { pointerType: "mouse" },
        actions: [
          { type: "pointerMove", x: 0, y: 0 },
          { type: "pointerDown", button: 0 },
          { type: "pointerUp", button: 0 },
        ],
      },
    ])
  }

  loginUsingIframe(
    _profileType?: string,
    _targets?: string,
    _derivation?: string,
  ) {}
}

export default new Page()
