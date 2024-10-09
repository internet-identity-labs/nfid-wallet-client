import Page from "./page.js"
import Profile from "./profile.js"
import Nft from "./nft.js"

export class Assets {
  get sendDialogWindow() {
    return $("#sendFT")
  }

  private get assetLabel() {
    return "[id*='token_"
  }

  public get getBalance() {
    return $("#balance")
  }

  public get switchSendType() {
    return $("#send_type_toggle")
  }

  public async getAssetBalance(label: string) {
    return $(this.assetLabel + `${label.replace(/\s/g, "")}` + "_balance']")
  }

  public async getCurrency(label: string) {
    return $(this.assetLabel + `${label.replace(/\s/g, "")}` + "_currency']")
  }

  public async getBlockchain(label: string) {
    return $(this.assetLabel + `${label.replace(/\s/g, "")}` + "_category']")
  }


  get principal() {
    return $("#principal")
  }

  private get address() {
    return $("#address")
  }

  get activityTab() {
    return $("#tab_Activity")
  }

  public async openAssetOptionsOnSR() {
    const assetOptions = await $("#choose_modal")
    await assetOptions.waitForDisplayed({
      timeout: 45000,
    })
    await assetOptions.click()
  }

  public async chooseCurrencyOption(currency: string, chain: string) {
    const option = await $(
      `#option_group_${chain.replace(/\s/g, "")} #choose_option_${currency}`,
    )
    await option.click()
  }

  public async sendFTto(address: string, amount: string) {
    await Nft.addressField.setValue(address)
    await Nft.amountField.setValue(amount)

    await this.getBalance.waitForExist({ timeout: 10000 })
    await this.getFee.waitForExist({ timeout: 35000 })

    await this.sendDialogWindow.click()
  }

  public get getFee() {
    return $("#fee")
  }

  public async sendDialog() {
    await this.waitUntilElementsLoadedProperly(Profile.sendButton, this.switchSendType)
  }

  public async sendNFTDialog() {
    await this.waitUntilElementsLoadedProperly(Profile.sendButton, this.switchSendType)
    await this.switchSendType.click()
    await Page.loader.waitForExist({ reverse: true, timeout: 15000 })
  }

  public async receiveDialog() {
    await this.waitUntilElementsLoadedProperly(Profile.receiveButton, $("#first_part"))
  }

  public async getAccountId(isAddress?: boolean) {
    let parent
    await this.address.waitForDisplayed({ timeout: 10000 })
    if (isAddress) {
      parent = await this.address
    } else {
      parent = await this.principal
    }
    const firstAddressPart = await parent.$("#first_part")
    await firstAddressPart.waitForDisplayed({
      timeout: 7000,
    })
    const secondAddressPart = await parent.$("#second_part")
    await secondAddressPart.waitForDisplayed({
      timeout: 7000,
    })
    await browser.waitUntil(
      async () => {
        return (
          (await firstAddressPart.getText()) != "" &&
          (await secondAddressPart.getText()) != ""
        )
      },
      { timeout: 15000, timeoutMsg: "Address is still empty after 15 sec" },
    )
    return { firstAddressPart, secondAddressPart }
  }

  public async fromAccountOption() {
    const assetOptions = await $("#default_trigger_From")
    await assetOptions.click()
  }

  public async chooseOption(account: string) {
    const defaultAcc = await $(`#choose_option_${account.replace(/\s/g, "")}`)
    await defaultAcc.waitForExist({
      timeout: 30000,
    })
    await defaultAcc.click()
  }

  public async chooseAccountFrom(account: string) {
    await this.fromAccountOption()
    await this.chooseOption(account)
  }

  public async successWindow() {
    const sw = await $(`#success_window_3`)
    await sw.waitForExist({
      timeout: 80000,
    })
  }

  public async openActivity() {
    const activityIcon = await $("#tab_Activity")
    await Page.loader.waitForDisplayed({ reverse: true, timeout: 55000 })

    await activityIcon.waitForDisplayed({ timeout: 10000 })
    await activityIcon.click()
  }

  public async waitUntilElementsLoadedProperly(
    clickElement: ChainablePromiseElement,
    waitForElement: ChainablePromiseElement,
  ) {
    await browser.waitUntil(async () => {
      try {
        await Profile.waitUntilBalanceLoaded()
        await Page.loader.waitForDisplayed({ reverse: true, timeout: 55000 })

        await clickElement.waitForClickable({ timeout: 15000 })
        await clickElement.click()
        await Page.loader.waitForDisplayed({ reverse: true, timeout: 55000 })
        await waitForElement.waitForDisplayed()
        return true
      } catch (e) {
        await browser.refresh()
      }
    }, { timeout: 40000, timeoutMsg: "Element didn't load properly in 40sec" })
  }
}

export default new Assets()
