class BasePage {
  async navigateTo(path: string) {
    await browser.url(path)
  }

  async switches(section: string) {
    switch (section) {
      case "The Identity Layer":
        return browser.$("/html//div[@id='root']/div/div//div[.='The Identity Layer for the Internet']")
      case "Only with NFID":
        return browser.$("div:nth-of-type(6) > .col-span-12 > .font-bold.py-12.text-4xl.text-center")
      case "Our mission":
        return browser.$("div:nth-of-type(7) > .col-span-12 > .font-bold.py-12.text-4xl.text-center")
      case "Where you can use NFID today":
        return browser.$("div:nth-of-type(8) > .col-span-12 > .font-bold.py-12.text-4xl.text-center")
    }
  }

  async clickOnSection(sectionName) {
    await (await this.switches(sectionName)).waitForDisplayed()
    await (await this.switches(sectionName)).click()
    await browser.pause(3000)
    await (
      await browser.$('//*[@id="root"]/div/div/header/div/div/div[1]/a/div')
    ).scrollIntoView()
  }

  async click(ele: WebdriverIO.Element) {
    await ele.waitForClickable({ timeout: 5000 })
    if (!ele.elementId) {
      throw Error(ele.error.message)
    }
    await ele.click()
  }

  async typeInto(ele: WebdriverIO.Element, text: string) {
    await ele.waitForDisplayed({ timeout: 5000 })
    if (!ele.elementId) {
      throw Error(ele.error.message)
    }
    await ele.setValue(text)
  }

  async getSectionName(sectionName) {
    await (await this.switches(sectionName)).waitForDisplayed()
    return await (await this.switches(sectionName)).getText()
  }
}

export default new BasePage()
