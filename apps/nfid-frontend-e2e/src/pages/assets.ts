export class Assets {
  private get assetLabel() {
    return "[id*='token_"
  }

  private get assetElement() {
    return "[id*='"
  }

  public async getBalance() {
    return $("#balance")
  }

  public async getAssetBalance(label: string) {
    return $(this.assetLabel + `${label.replace(/\s/g, "")}` + "_balance']")
  }

  public async getCurrency(label: string) {
    return $(this.assetLabel + `${label.replace(/\s/g, "")}` + "_currency']")
  }

  public async getBlockchain(label: string) {
    return $(this.assetLabel + `${label.replace(/\s/g, "")}` + "_blockchain']")
  }

  private getTokenBalance(chain: string) {
    return `#token_${chain.replace(/\s/g, "")}_balance`
  }

  private get principal() {
    return $("#principal")
  }

  private get address() {
    return $("#address")
  }

  public async openAssetOptionsOnSR() {
    const assetOptions = await $("#choose_modal")
    await assetOptions.waitForDisplayed({
      timeout: 45000,
    })
    await assetOptions.click()
  }

  public async waitWhileCalculated(assetLabel: string, currency: string) {
    const tokenBalance = await $(this.getTokenBalance(assetLabel))
    await tokenBalance.waitForDisplayed({
      timeout: 10000,
    })

    await tokenBalance.waitUntil(
      async () => (await tokenBalance.getText()) !== `0 ${currency}`,
    )
  }

  public async chooseCurrencyOption(currency: string, chain: string) {
    const option = await $(
      `#option_group_${chain.replace(/\s/g, "")} #choose_option_${currency}`,
    )
    await option.click()
  }

  public async sendFTto(address: string, amount: string) {
    const target = await $("#input")
    await target.setValue(address)
    const amountToSend = await $("#amount")
    await amountToSend.setValue(amount)

    const assetBalance = await this.getBalance()
    const fee = await this.getFee()
    await assetBalance.waitForExist({ timeout: 10000 })
    await fee.waitForExist({ timeout: 35000 })

    const sendButton = await $("#sendFT")
    await sendButton.click()
  }

  public async getFee() {
    return $("#fee")
  }

  public async sendDialog() {
    const loader = await $("#loader")
    await loader.waitForDisplayed({ reverse: true, timeout: 40000 })
    const sendReceiveButton = await $("#sendReceiveButton")
    await sendReceiveButton.waitForDisplayed({
      timeout: 7000,
    })
    await sendReceiveButton.click()
    await loader.waitForDisplayed({ reverse: true, timeout: 40000 })
    await (await $("#sendFT")).waitForDisplayed({ timeout: 5000 })
  }

  public async sendNFTDialog() {
    const sendReceiveButton = await $("#sendReceiveButton")
    await sendReceiveButton.waitForDisplayed({
      timeout: 7000,
    })
    await sendReceiveButton.click()
    const loader = await $("#loader")
    await loader.waitForExist({ reverse: true, timeout: 15000 })
    await $("#send_type_toggle").click()
    await loader.waitForExist({ reverse: true, timeout: 15000 })
  }

  public async receiveDialog() {
    await this.sendDialog()
    const tabReceive = await $("#tab_receive")
    await tabReceive.waitForDisplayed({ timeout: 10000 })
    await tabReceive.waitForClickable({ timeout: 15000 })
    await tabReceive.click()
  }

  public async getAccountId(isAddress?: boolean) {
    let parent
    if (isAddress) {
      parent = await this.address
    } else {
      parent = await this.principal
    }
    const firstAddressPart = await parent.$("#first_part")
    await firstAddressPart.waitForExist({
      timeout: 7000,
    })
    const secondAddressElement = await parent.$("#second_part")
    await secondAddressElement.waitForExist({
      timeout: 7000,
    })
    return { firstAddressPart, secondAddressElement }
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

  public async chooseAccountReceive(account: string) {
    const assetOptions = await $("#option_Accounts")
    await assetOptions.click()
    await this.chooseOption(account)
  }

  public async successWindow() {
    const sw = await $(`#success_window_3`)
    await sw.waitForExist({
      timeout: 50000,
    })
  }

  public async openAssetByLabel(name: string) {
    await $(
      this.assetLabel + `${name.replace(/\s/g, "")}` + "']",
    ).waitForDisplayed({
      timeout: 17000,
      timeoutMsg: "Asset has not been showed! Missing asset label!",
    })
    await $(this.assetLabel + `${name.replace(/\s/g, "")}` + "']").click()
  }

  public async openElementById(name: string) {
    await $(this.assetElement + `${name}` + "']").waitForDisplayed({
      timeout: 15000,
      timeoutMsg: "Element has not been showed! Missing asset label!",
    })
    await $(this.assetElement + `${name}` + "']").click()
  }

  public async isElementSelected(name: string, falseCase: string) {
    await $(this.assetElement + `${name}` + "']").waitForDisplayed({
      timeout: 15000,
      timeoutMsg: "Element has not been showed! Missing asset label!",
    })
    let isSel = await $(this.assetElement + `${name}` + "']").isSelected()
    if (falseCase) {
      expect(isSel).toEqual(false)
    } else {
      expect(isSel).toEqual(true)
    }
  }

  public async openActivity() {
    const activityIcon = await $("#activity")
    const loader = await $("#loader")
    await loader.waitForDisplayed({ reverse: true, timeout: 55000 })

    await activityIcon.waitForDisplayed({ timeout: 10000 })
    await activityIcon.click()
  }
}

export default new Assets()
