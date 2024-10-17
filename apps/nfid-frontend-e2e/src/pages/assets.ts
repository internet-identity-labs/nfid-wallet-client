import Page from "./page.js"
import Profile from "./profile.js"
import Nft from "./nft.js"

export class Assets {

  get amountField() {
    return $("#amount")
  }

  get sendDialogWindow() {
    return $("#sendButton")
  }

  private get assetLabel() {
    return "[id*='token_"
  }

  get allTokensOnTokenTab() {
    return $$("[id^=\"token_\"]")
  }

  public get getBalance() {
    return $("#balance")
  }

  public get switchSendType() {
    return $("#send_type_toggle")
  }

  public async getCurrency(label: string) {
    let locator = $(this.assetLabel + `${label.replace(/\s/g, "")}_currency`)
    await locator.waitForDisplayed({ timeout: 10000 })
    return locator
  }

  public async getBlockchain(label: string) {
    let locator = $(this.assetLabel + `${label.replace(/\s/g, "")}_category`)
    await locator.waitForDisplayed({ timeout: 10000 })
    return locator
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

  get tokensTab() {
    return $("tab_Tokens")
  }

  get NFTtab() {
    return $("#tab_NFTs")
  }

  get chooseModalButton() {
    return $("#choose_modal")
  }

  get chooseNFTinSend() {
    return $("#choose-nft")
  }

  get successWindow() {
    return $("#success_window_3")
  }

  get backButtonInSendWindow() {
    return $("svg.mr-2")
  }

  public async tokenBalance(tokenName: string) {
    let locator = $(`#token_${tokenName.replace(/\s/g, "")}_balance`)
    await locator.waitForDisplayed({ timeout: 10000 })
    return locator
  }

  public tokenLabel(label) {
    return $(`#token_${label.replace(/\s/g, "")}`)
  }

  public currencyOption(chain: string, currency: string) {
    return $(`#option_group_${chain.replace(/\s/g, "")} #choose_option_${currency}`)
  }

  public getTokenByNameInSend(token: string) {
    return $(`#choose_option_${token}`)
  }

  public async openAssetOptionsOnSR() {
    await this.chooseModalButton.waitForClickable({ timeout: 45000 })
    await this.chooseModalButton.click()
  }

  public async sendFTto(address: string, amount: string) {
    await Nft.addressField.setValue(address)
    await this.amountField.setValue(amount)

    await this.getBalance.waitForExist({ timeout: 10000 })
    await this.getFee.waitForExist({ timeout: 35000 })

    await this.sendDialogWindow.click()
  }

  public async sendNFTto(address: string) {
    await Nft.addressField.setValue(address)
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
