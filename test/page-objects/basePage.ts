class BasePage {

    /**Page objects */
    get usernameInputBox() { return browser.$(`#Email`) }
    get passwordInputBox() { return browser.$(`#Password`) }
    get loginBtn() { return browser.$(`button=Log in`) }

    /**All reusable web functions */
    async navigateTo(path: string) {
        await browser.url(path);
        await browser.maximizeWindow();
        await (await browser.$('#L2AGLb > div')).click();
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
}

export default new BasePage();
